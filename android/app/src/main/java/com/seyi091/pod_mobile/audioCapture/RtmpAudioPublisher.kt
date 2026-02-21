package com.seyi091.pod_mobile.audioCapture

import android.content.Context
import android.media.*
import android.os.Process
import android.util.Log
import com.seyi091.pod_mobile.rtmp.RtmpHandshake
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.net.Socket

class RtmpAudioPublisher(
    private val host: String,
    private val port: Int,
    private val sampleRate: Int = 44100,
    private val channels: Int = 1,
    private val bitrate: Int = 128_000,
    private val context: Context
) : Thread() {

    companion object {
        private const val TAG = "RtmpAudioPublisher"
        private const val SAMPLES_PER_FRAME = 1024
    }

    private var socket: Socket? = null
    private var out: OutputStream? = null
    private var audioRecord: AudioRecord? = null
    private var codec: MediaCodec? = null

    private var fileOutputStream: FileOutputStream? = null
    private var audioFile: File? = null

    @Volatile private var running = false

    private var timestampMs = 0
    private var sentConfig = false
    private var soundHeader: Byte = 0

    override fun run() {
        Process.setThreadPriority(Process.THREAD_PRIORITY_AUDIO)

        try {
            connect()

            val handshake = RtmpHandshake(socket!!)
            handshake.perform()

            initAudio()
            initEncoder()

            running = true
            captureLoop()

        } catch (e: Exception) {
            Log.e(TAG, "Fatal error", e)
        } finally {
            cleanup()
        }
    }

    fun stopPublishing() {
        running = false
    }

    // ---------------------------------------------------
    // Connection
    // ---------------------------------------------------

    private fun connect() {
        socket = Socket(host, port)
        out = socket!!.getOutputStream()
        Log.i(TAG, "Connected to $host:$port")
    }

    // ---------------------------------------------------
    // Audio Input (PCM capture)
    // ---------------------------------------------------

    private fun initAudio() {
        val bufferSize = getBufferSize()

        val channelConfig =
            if (channels == 2)
                AudioFormat.CHANNEL_IN_STEREO
            else
                AudioFormat.CHANNEL_IN_MONO

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            throw IllegalStateException("AudioRecord init failed")
        }

        // Create raw PCM file
        audioFile = File(context.getExternalFilesDir(null), "audio_capture.pcm")
        fileOutputStream = FileOutputStream(audioFile)

        Log.i(TAG, "Saving RAW PCM to: ${audioFile!!.absolutePath}")

        audioRecord!!.startRecording()
    }

    // ---------------------------------------------------
    // Encoder
    // ---------------------------------------------------

    private fun initEncoder() {
        val format = MediaFormat.createAudioFormat(
            MediaFormat.MIMETYPE_AUDIO_AAC,
            sampleRate,
            channels
        ).apply {
            setInteger(MediaFormat.KEY_BIT_RATE, bitrate)
            setInteger(
                MediaFormat.KEY_AAC_PROFILE,
                MediaCodecInfo.CodecProfileLevel.AACObjectLC
            )
        }

        codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC)
        codec!!.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        codec!!.start()

        soundHeader =
            ((10 shl 4) or (3 shl 2) or (1 shl 1) or (if (channels == 2) 1 else 0)).toByte()
    }

    // ---------------------------------------------------
    // Main Loop (ONE read path only)
    // ---------------------------------------------------
    private fun captureLoop() {
        val pcmBuffer = ByteArray(SAMPLES_PER_FRAME * channels * 2)
        val info = MediaCodec.BufferInfo()

        while (running) {

            val read = audioRecord!!.read(pcmBuffer, 0, pcmBuffer.size)
            if (read <= 0) continue

            var max = 0
            var i = 0
            while (i < read - 1) {
                val lo = pcmBuffer[i].toInt() and 0xFF
                val hi = pcmBuffer[i + 1].toInt()
                val sample = (hi shl 8) or lo
                val abs = kotlin.math.abs(sample)
                if (abs > max) max = abs
                i += 2
            }
            Log.d("AUDIO_LEVEL", "peak=$max")

            // ✅ write RAW PCM
            fileOutputStream?.write(pcmBuffer, 0, read)

            // ✅ send to encoder
            val inIndex = codec!!.dequeueInputBuffer(10_000)
            if (inIndex >= 0) {
                codec!!.getInputBuffer(inIndex)?.apply {
                    clear()
                    put(pcmBuffer, 0, read)
                }

                codec!!.queueInputBuffer(
                    inIndex,
                    0,
                    read,
                    timestampMs * 1000L,
                    0
                )

                timestampMs += read * 1000 / (sampleRate * channels * 2)
            }

            // ✅ drain encoder
            var outIndex = codec!!.dequeueOutputBuffer(info, 0)
            while (outIndex >= 0) {

                val buffer = codec!!.getOutputBuffer(outIndex)
                if (buffer != null && info.size > 0) {

                    buffer.position(info.offset)
                    buffer.limit(info.offset + info.size)

                    if (info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0) {
                        val config = ByteArray(info.size)
                        buffer.get(config)
                        sendAacSequenceHeader(config)
                        sentConfig = true

                    } else if (sentConfig) {
                        val frame = ByteArray(info.size)
                        buffer.get(frame)
                        sendAacFrame(frame)
                    }
                }

                codec!!.releaseOutputBuffer(outIndex, false)
                outIndex = codec!!.dequeueOutputBuffer(info, 0)
            }
        }
    }

    // ---------------------------------------------------
    // RTMP
    // ---------------------------------------------------

    private fun sendAacSequenceHeader(config: ByteArray) {
        val payload = ByteArray(2 + config.size)
        payload[0] = soundHeader
        payload[1] = 0
        System.arraycopy(config, 0, payload, 2, config.size)
        sendRtmpAudioMessage(payload)
    }

    private fun sendAacFrame(frame: ByteArray) {
        val payload = ByteArray(2 + frame.size)
        payload[0] = soundHeader
        payload[1] = 1
        System.arraycopy(frame, 0, payload, 2, frame.size)
        sendRtmpAudioMessage(payload)
    }

    private fun sendRtmpAudioMessage(payload: ByteArray) {
        val baos = ByteArrayOutputStream()

        baos.write(0x04)

        baos.write(byteArrayOf(
            ((timestampMs shr 16) and 0xFF).toByte(),
            ((timestampMs shr 8) and 0xFF).toByte(),
            (timestampMs and 0xFF).toByte()
        ))

        val len = payload.size
        baos.write(byteArrayOf(
            ((len shr 16) and 0xFF).toByte(),
            ((len shr 8) and 0xFF).toByte(),
            (len and 0xFF).toByte()
        ))

        baos.write(8)
        baos.write(byteArrayOf(1, 0, 0, 0))
        baos.write(payload)

        out!!.write(baos.toByteArray())
        out!!.flush()
    }

    // ---------------------------------------------------
    // Cleanup
    // ---------------------------------------------------

private fun cleanup() {
    Log.i(TAG, "Starting cleanup...")
    try {
        audioRecord?.stop()
    } catch (_: Exception) {}

    audioRecord?.release()
    codec?.stop()
    codec?.release()

    try {
        fileOutputStream?.flush()
        fileOutputStream?.close()
        Log.i(TAG, "File closed successfully at: ${audioFile?.absolutePath}")
        Log.i(TAG, "File size: ${audioFile?.length()} bytes")
    } catch (e: Exception) {
        Log.e(TAG, "Error closing file: $e")
    }

    socket?.close()
    Log.i(TAG, "Cleanup complete")
}

    private fun getBufferSize(): Int {
        return AudioRecord.getMinBufferSize(
            sampleRate,
            if (channels == 2)
                AudioFormat.CHANNEL_IN_STEREO
            else
                AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
    }
}
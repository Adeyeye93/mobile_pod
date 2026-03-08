package com.seyi091.pod_mobile.rtmp

import android.util.Log
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.io.OutputStream

/**
 * Sends the three AMF commands required by the RTMP protocol before any audio can flow:
 *
 * 1. connect — establishes the RTMP application connection
 * 2. createStream — requests a stream ID from the server
 * 3. publish — tells the server we want to publish to a stream key
 *
 * The server processes these in order and responds to each. We read and discard the responses — we
 * trust the server accepted them if it does not close the connection.
 *
 * ## Why we don't parse responses
 *
 * Fully parsing AMF responses requires a complete AMF0 decoder. For a publisher client, the
 * practical approach is to send the commands, wait briefly, then start sending audio. If the stream
 * key is invalid the server closes the socket and the publisher catches the IOException when it
 * tries to write audio.
 *
 * If you want proper error handling (showing the broadcaster a "Invalid stream key" message), you
 * would need to parse the onStatus response and check the "code" field. That can be added later.
 */
class RtmpAmfCommands(private val input: InputStream, private val output: OutputStream) {

    companion object {
        private const val TAG = "RtmpAmfCommands"
    }

    /**
     * Sends connect → createStream → publish in sequence. Call this immediately after the handshake
     * completes.
     *
     * @param host The RTMP server host — used as the app name
     * @param streamKey The stream key fetched from your backend API
     */
    fun perform(host: String, streamKey: String) {
        Log.i(TAG, "Sending AMF commands — stream key: $streamKey")

        sendConnect(host)
        readServerResponse("connect")

        sendCreateStream()
        readServerResponse("createStream")

        sendPublish(streamKey)
        // No need to read response here — audio starts flowing immediately
        // The server sends onStatus which we ignore for now

        Log.i(TAG, "AMF commands complete — ready to send audio")
    }

    // ---------------------------------------------------------------------------
    // connect
    //
    // AMF structure:
    //   "connect" (string)
    //   1.0 (number — transaction ID)
    //   { app: host, flashVer: "FMLE/3.0", type: "nonprivate" } (object)
    // ---------------------------------------------------------------------------

    private fun sendConnect(host: String) {
        val amfBody = ByteArrayOutputStream()

        amfBody.write(amfString("connect"))
        amfBody.write(amfNumber(1.0))
        amfBody.write(
                amfObject(
                        mapOf(
                                "app" to host,
                                "flashVer" to "FMLE/3.0 (compatible; FMSc/1.0)",
                                "tcUrl" to "rtmp://$host/live",
                                "type" to "nonprivate"
                        )
                )
        )

        val body = amfBody.toByteArray()

        Log.d(TAG, "Sending connect (${body.size} bytes)")
        writeRtmpMessage(
                chunkStreamId = 3,
                messageTypeId = 20, // AMF0 command
                streamId = 0,
                timestamp = 0,
                payload = body
        )
    }

    // ---------------------------------------------------------------------------
    // createStream
    //
    // AMF structure:
    //   "createStream" (string)
    //   2.0 (number — transaction ID)
    //   null
    // ---------------------------------------------------------------------------

    private fun sendCreateStream() {
        val amfBody = ByteArrayOutputStream()

        amfBody.write(amfString("createStream"))
        amfBody.write(amfNumber(2.0))
        amfBody.write(amfNull())

        val body = amfBody.toByteArray()

        Log.d(TAG, "Sending createStream (${body.size} bytes)")
        writeRtmpMessage(
                chunkStreamId = 3,
                messageTypeId = 20,
                streamId = 0,
                timestamp = 0,
                payload = body
        )
    }

    // ---------------------------------------------------------------------------
    // publish
    //
    // AMF structure:
    //   "publish" (string)
    //   0.0 (number — transaction ID, 0 for publish)
    //   null
    //   streamKey (string — this is what the backend authenticates)
    //   "live" (string — publish type)
    // ---------------------------------------------------------------------------

    private fun sendPublish(streamKey: String) {
        val amfBody = ByteArrayOutputStream()

        amfBody.write(amfString("publish"))
        amfBody.write(amfNumber(0.0))
        amfBody.write(amfNull())
        amfBody.write(amfString(streamKey))
        amfBody.write(amfString("live"))

        val body = amfBody.toByteArray()

        Log.d(TAG, "Sending publish with stream key (${body.size} bytes)")
        writeRtmpMessage(
                chunkStreamId = 8, // publish uses chunk stream 8 by convention
                messageTypeId = 20,
                streamId = 1, // stream ID 1 — matches createStream response
                timestamp = 0,
                payload = body
        )
    }

    // ---------------------------------------------------------------------------
    // Read and discard server response
    //
    // We read enough bytes to clear the server's response from the socket
    // buffer so it does not interfere with audio data. A full AMF response
    // is typically 100-300 bytes. We read with a short timeout.
    // ---------------------------------------------------------------------------

    private fun readServerResponse(commandName: String) {
        try {
            socket_read_with_timeout(500)
            Log.d(TAG, "Server responded to $commandName")
        } catch (e: Exception) {
            // Timeout is fine — server may batch responses
            Log.d(TAG, "No immediate response to $commandName (timeout) — continuing")
        }
    }

    private fun socket_read_with_timeout(timeoutMs: Int) {
        val buffer = ByteArray(512)
        val previousTimeout =
                try {
                    input.available()
                } catch (e: Exception) {
                    0
                }

        // Read whatever is available — non-blocking drain
        var attempts = 0
        val deadline = System.currentTimeMillis() + timeoutMs

        while (System.currentTimeMillis() < deadline) {
            val available = input.available()
            if (available > 0) {
                val toRead = minOf(available, buffer.size)
                input.read(buffer, 0, toRead)
                Log.d(TAG, "Drained $toRead bytes from server response")
                return
            }
            Thread.sleep(20)
            attempts++
        }
    }

    // ---------------------------------------------------------------------------
    // RTMP chunk writer
    //
    // Writes a basic RTMP chunk with a Type 0 (full) header.
    // Type 0 is always safe — it includes all timestamp, length, type,
    // and stream ID fields explicitly.
    // ---------------------------------------------------------------------------

    private fun writeRtmpMessage(
            chunkStreamId: Int,
            messageTypeId: Int,
            streamId: Int,
            timestamp: Int,
            payload: ByteArray
    ) {
        val out = ByteArrayOutputStream()

        // Basic header — fmt=0 (2 bits), chunk stream ID (6 bits)
        // fmt=0 means full Type 0 message header follows
        out.write(chunkStreamId and 0x3F)

        // Message header Type 0 (11 bytes):
        // timestamp (3 bytes)
        out.write(
                byteArrayOf(
                        ((timestamp shr 16) and 0xFF).toByte(),
                        ((timestamp shr 8) and 0xFF).toByte(),
                        (timestamp and 0xFF).toByte()
                )
        )

        // message length (3 bytes)
        val len = payload.size
        out.write(
                byteArrayOf(
                        ((len shr 16) and 0xFF).toByte(),
                        ((len shr 8) and 0xFF).toByte(),
                        (len and 0xFF).toByte()
                )
        )

        // message type ID (1 byte)
        out.write(messageTypeId)

        // stream ID (4 bytes, little-endian)
        out.write(
                byteArrayOf(
                        (streamId and 0xFF).toByte(),
                        ((streamId shr 8) and 0xFF).toByte(),
                        ((streamId shr 16) and 0xFF).toByte(),
                        ((streamId shr 24) and 0xFF).toByte()
                )
        )

        // payload
        out.write(payload)

        output.write(out.toByteArray())
        output.flush()
    }

    // ---------------------------------------------------------------------------
    // AMF0 encoders
    // ---------------------------------------------------------------------------

    // AMF string: type 0x02 + 2 byte length + UTF-8 bytes
    private fun amfString(value: String): ByteArray {
        val bytes = value.toByteArray(Charsets.UTF_8)
        val out = ByteArrayOutputStream()
        out.write(0x02)
        out.write((bytes.size shr 8) and 0xFF)
        out.write(bytes.size and 0xFF)
        out.write(bytes)
        return out.toByteArray()
    }

    // AMF number: type 0x00 + 8 byte big-endian double
    private fun amfNumber(value: Double): ByteArray {
        val out = ByteArrayOutputStream()
        out.write(0x00)
        val bits = java.lang.Double.doubleToLongBits(value)
        for (i in 7 downTo 0) {
            out.write(((bits shr (i * 8)) and 0xFF).toInt())
        }
        return out.toByteArray()
    }

    // AMF null: type 0x05
    private fun amfNull(): ByteArray = byteArrayOf(0x05)

    // AMF object: type 0x03 + key-value pairs + end marker (0x00 0x00 0x09)
    private fun amfObject(map: Map<String, String>): ByteArray {
        val out = ByteArrayOutputStream()
        out.write(0x03)

        for ((key, value) in map) {
            val keyBytes = key.toByteArray(Charsets.UTF_8)
            // Key: 2 byte length + UTF-8 bytes (no type byte for keys)
            out.write((keyBytes.size shr 8) and 0xFF)
            out.write(keyBytes.size and 0xFF)
            out.write(keyBytes)
            // Value as AMF string
            out.write(amfString(value))
        }

        // Object end marker
        out.write(byteArrayOf(0x00, 0x00, 0x09))
        return out.toByteArray()
    }
}

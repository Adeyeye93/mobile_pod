package com.seyi091.pod_mobile.rtmp

import android.util.Log
import java.io.InputStream
import java.io.OutputStream
import java.net.Socket
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.random.Random

class RtmpHandshake(
    private val socket: Socket
) {

    companion object {
        private const val TAG = "RtmpHandshake"
        private const val RTMP_VERSION: Byte = 0x03
        private const val HANDSHAKE_SIZE = 1536
    }

    private val input: InputStream = socket.getInputStream()
    private val output: OutputStream = socket.getOutputStream()

    fun perform() {
        Log.d(TAG, "Starting RTMP handshake")

        sendC0C1()
        receiveS0S1()
        sendC2()
        receiveS2()

        Log.d(TAG, "RTMP handshake completed")
    }

    // --------------------------------------------------
    // C0 + C1
    // --------------------------------------------------

    private fun sendC0C1() {
        Log.d(TAG, "Sending C0 + C1")

        val c0 = byteArrayOf(RTMP_VERSION)
        val c1 = ByteArray(HANDSHAKE_SIZE)

        val buffer = ByteBuffer.wrap(c1).order(ByteOrder.BIG_ENDIAN)

        val time = (System.currentTimeMillis() / 1000).toInt()
        buffer.putInt(time)     // time
        buffer.putInt(0)        // zero

        Random.nextBytes(c1, 8, HANDSHAKE_SIZE - 8)

        output.write(c0)
        output.write(c1)
        output.flush()
    }

    // --------------------------------------------------
    // S0 + S1
    // --------------------------------------------------

    private fun receiveS0S1() {
        Log.d(TAG, "Receiving S0 + S1")

        val s0 = readFully(1)
        require(s0[0] == RTMP_VERSION) {
            "Invalid S0 version: ${s0[0]}"
        }

        val s1 = readFully(HANDSHAKE_SIZE)
        cachedS1 = s1
    }

    // --------------------------------------------------
    // C2 (echo S1)
    // --------------------------------------------------

    private lateinit var cachedS1: ByteArray

    private fun sendC2() {
        Log.d(TAG, "Sending C2 (echo S1)")
        output.write(cachedS1)
        output.flush()
    }

    // --------------------------------------------------
    // S2 (echo C1)
    // --------------------------------------------------

    private fun receiveS2() {
        Log.d(TAG, "Receiving S2")
        readFully(HANDSHAKE_SIZE)
    }

    // --------------------------------------------------
    // Utils
    // --------------------------------------------------

    private fun readFully(size: Int): ByteArray {
        val buffer = ByteArray(size)
        var offset = 0

        while (offset < size) {
            val read = input.read(buffer, offset, size - offset)
            if (read < 0) {
                throw IllegalStateException("Stream closed during handshake")
            }
            offset += read
        }

        return buffer
    }
}

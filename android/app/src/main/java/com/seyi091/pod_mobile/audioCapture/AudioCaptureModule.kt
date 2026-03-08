package com.seyi091.pod_mobile.audioCapture

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioCaptureModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "AudioCapture"
  }

  private var publisher: RtmpAudioPublisher? = null

  override fun getName(): String = "AudioCapture"

  // ----------------------------------------------------
  // START
  // ----------------------------------------------------

  @ReactMethod
  fun startCapture(
          sampleRate: Int,
          channels: Int,
          bitrate: Int,
          serverHost: String,
          serverPort: Int,
          streamKey: String, // ← added: fetched from backend before calling this
          promise: Promise
  ) {
    if (publisher != null) {
      promise.reject("ALREADY_RUNNING", "Streaming already active")
      return
    }

    try {
      Log.i(TAG, "Starting RTMP audio publisher — stream key: $streamKey")
      sendEvent("onStatus", "Starting RTMP audio stream")

      publisher =
              RtmpAudioPublisher(
                              host = serverHost,
                              port = serverPort,
                              streamKey = streamKey,
                              sampleRate = sampleRate,
                              channels = channels,
                              bitrate = bitrate,
                              context = reactContext
                      )
                      .also { it.start() }

      sendEvent("onStatus", "RTMP audio streaming started")
      promise.resolve("RTMP audio publishing started")
    } catch (e: Exception) {
      Log.e(TAG, "Failed to start RTMP publisher", e)
      sendEvent("onError", e.message ?: "Start failed")
      promise.reject("START_FAILED", e)
    }
  }

  // ----------------------------------------------------
  // STOP
  // Fixed: no longer blocks the bridge thread with Thread.sleep
  // ----------------------------------------------------

  @ReactMethod
  fun stopCapture(promise: Promise) {
    val currentPublisher =
            publisher
                    ?: run {
                      promise.resolve("Already stopped")
                      return
                    }

    publisher = null

    // Run stop on a background thread — never block the bridge thread
    Thread {
              try {
                currentPublisher.stopPublishing()
                sendEvent("onStatus", "RTMP audio streaming stopped")
                promise.resolve("Streaming stopped")
              } catch (e: Exception) {
                Log.e(TAG, "Failed to stop publisher", e)
                sendEvent("onError", e.message ?: "Stop failed")
                promise.reject("STOP_FAILED", e)
              }
            }
            .start()
  }

  // ----------------------------------------------------
  // EVENTS
  // ----------------------------------------------------

  private fun sendEvent(event: String, message: String) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, message)
  }
}

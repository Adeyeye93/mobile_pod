package com.seyi091.pod_mobile.audioCapture

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioCaptureModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

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
    promise: Promise
  ) {
    if (publisher != null) {
      promise.reject("ALREADY_RUNNING", "Streaming already active")
      return
    }

    try {
      Log.i(TAG, "Starting RTMP audio publisher")
      sendEvent("onStatus", "Starting RTMP audio stream")

      publisher = RtmpAudioPublisher(
        host = serverHost,
        port = serverPort,
        sampleRate = sampleRate,
        channels = channels,
        bitrate = bitrate,
        context = reactContext
      ).also {
        it.start()
      }

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
  // ----------------------------------------------------

  @ReactMethod
  fun stopCapture(promise: Promise) {
    try {
      publisher?.stopPublishing()
      publisher = null

      sendEvent("onStatus", "RTMP audio streaming stopped")
      promise.resolve("Streaming stopped")
    } catch (e: Exception) {
      Log.e(TAG, "Failed to stop publisher", e)
      sendEvent("onError", e.message ?: "Stop failed")
      promise.reject("STOP_FAILED", e)
    }
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

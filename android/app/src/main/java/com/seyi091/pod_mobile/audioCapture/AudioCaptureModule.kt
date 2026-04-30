// package com.seyi091.pod_mobile.audioCapture

// import android.util.Log
// import com.facebook.react.bridge.*
// import com.facebook.react.modules.core.DeviceEventManagerModule

// class AudioCaptureModule(private val reactContext: ReactApplicationContext) :
//         ReactContextBaseJavaModule(reactContext) {

//   companion object {
//     private const val TAG = "AudioCapture"
//   }

//   private var publisher: RtmpAudioPublisher? = null

//   override fun getName(): String = "AudioCapture"

//   // ----------------------------------------------------
//   // START
//   // ----------------------------------------------------

//   @ReactMethod
//   fun startCapture(
//           sampleRate: Int,
//           channels: Int,
//           bitrate: Int,
//           serverHost: String,
//           serverPort: Int,
//           streamKey: String, // ← added: fetched from backend before calling this
//           promise: Promise
//   ) {
//     if (publisher != null) {
//       promise.reject("ALREADY_RUNNING", "Streaming already active")
//       return
//     }

//     try {
//       Log.i(TAG, "Starting RTMP audio publisher — stream key: $streamKey")
//       sendEvent("onStatus", "Starting RTMP audio stream")

//       publisher =
//               RtmpAudioPublisher(
//                               host = serverHost,
//                               port = serverPort,
//                               streamKey = streamKey,
//                               sampleRate = sampleRate,
//                               channels = channels,
//                               bitrate = bitrate,
//                               context = reactContext
//                       )
//                       .also { it.start() }

//       sendEvent("onStatus", "RTMP audio streaming started")
//       promise.resolve("RTMP audio publishing started")
//     } catch (e: Exception) {
//       Log.e(TAG, "Failed to start RTMP publisher", e)
//       sendEvent("onError", e.message ?: "Start failed")
//       promise.reject("START_FAILED", e)
//     }
//   }

//   // ----------------------------------------------------
//   // STOP
//   // Fixed: no longer blocks the bridge thread with Thread.sleep
//   // ----------------------------------------------------

//   @ReactMethod
//   fun stopCapture(promise: Promise) {
//     val currentPublisher =
//             publisher
//                     ?: run {
//                       promise.resolve("Already stopped")
//                       return
//                     }

//     publisher = null

//     // Run stop on a background thread — never block the bridge thread
//     Thread {
//               try {
//                 currentPublisher.stopPublishing()
//                 sendEvent("onStatus", "RTMP audio streaming stopped")
//                 promise.resolve("Streaming stopped")
//               } catch (e: Exception) {
//                 Log.e(TAG, "Failed to stop publisher", e)
//                 sendEvent("onError", e.message ?: "Stop failed")
//                 promise.reject("STOP_FAILED", e)
//               }
//             }
//             .start()
//   }

//   // ----------------------------------------------------
//   // EVENTS
//   // ----------------------------------------------------

//   private fun sendEvent(event: String, message: String) {
//     reactContext
//             .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
//             .emit(event, message)
//   }
// }


package com.seyi091.pod_mobile.audioCapture

import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioCaptureModule(private val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val TAG = "AudioCapture"
    // Static ref so AudioCaptureService can call back into this module
    var instance: AudioCaptureModule? = null
  }

  private var publisher: RtmpAudioPublisher? = null
  private var elapsedHandler: Handler? = null
  private var elapsedSeconds = 0L
  private var service: AudioCaptureService? = null

  init {
    instance = this
  }

  override fun getName(): String = "AudioCapture"

  // ── START ──────────────────────────────────────────────────────────────────

  @ReactMethod
  fun startCapture(
          sampleRate: Int,
          channels: Int,
          bitrate: Int,
          serverHost: String,
          serverPort: Int,
          streamKey: String,
          streamTitle: String, // ← new: pass from JS so notification shows title
          promise: Promise
  ) {
    if (publisher != null) {
      promise.reject("ALREADY_RUNNING", "Streaming already active")
      return
    }

    try {
      sendEvent("onStatus", "Starting RTMP audio stream")

      publisher =
              RtmpAudioPublisher(
                              host = serverHost,
                              port = serverPort,
                              streamKey = streamKey,
                              sampleRate = sampleRate,
                              channels = channels,
                              bitrate = bitrate,
                              context = reactContext,
                              onWaveform = { points ->
                                // Emit waveform array to JS every frame
                                val arr = Arguments.createArray()
                                points.forEach { arr.pushDouble(it.toDouble()) }
                                sendArrayEvent("onWaveform", arr)
                              }
                      )
                      .also { it.start() }

      // Start foreground service with notification
      val serviceIntent =
              Intent(reactContext, AudioCaptureService::class.java).apply {
                putExtra(AudioCaptureService.EXTRA_TITLE, streamTitle)
              }
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
        reactContext.startForegroundService(serviceIntent)
      } else {
        reactContext.startService(serviceIntent)
      }

      startElapsedTimer()

      sendEvent("onStatus", "RTMP audio streaming started")
      promise.resolve("RTMP audio publishing started")
    } catch (e: Exception) {
      Log.e(TAG, "Failed to start RTMP publisher", e)
      sendEvent("onError", e.message ?: "Start failed")
      promise.reject("START_FAILED", e)
    }
  }

  // ── STOP ──────────────────────────────────────────────────────────────────

  @ReactMethod
  fun stopCapture(promise: Promise) {
    val current =
            publisher
                    ?: run {
                      promise.resolve("Already stopped")
                      return
                    }
    publisher = null
    stopElapsedTimer()

    Thread {
              try {
                current.stopPublishing()
                reactContext.stopService(Intent(reactContext, AudioCaptureService::class.java))
                sendEvent("onStatus", "RTMP audio streaming stopped")
                promise.resolve("Streaming stopped")
              } catch (e: Exception) {
                sendEvent("onError", e.message ?: "Stop failed")
                promise.reject("STOP_FAILED", e)
              }
            }
            .start()
  }

  // Called by service when user taps End in notification
  fun stopCaptureFromService() {
    val current = publisher ?: return
    publisher = null
    stopElapsedTimer()
    Thread {
              current.stopPublishing()
              sendEvent("onStatus", "Stream ended from notification")
            }
            .start()
  }

  // ── MUTE ──────────────────────────────────────────────────────────────────

  @ReactMethod
  fun setMuted(muted: Boolean, promise: Promise) {
    publisher?.setMuted(muted)
    promise.resolve(null)
  }

  // Called by service when user taps Mute in notification
  fun toggleMute(muted: Boolean) {
    publisher?.setMuted(muted)
    sendEvent("onMuteChanged", if (muted) "muted" else "unmuted")
  }

  // ── ELAPSED TIMER ─────────────────────────────────────────────────────────

  private fun startElapsedTimer() {
    elapsedSeconds = 0L
    elapsedHandler = Handler(Looper.getMainLooper())
    val runnable =
            object : Runnable {
              override fun run() {
                elapsedSeconds++
                val h = elapsedSeconds / 3600
                val m = (elapsedSeconds % 3600) / 60
                val s = elapsedSeconds % 60
                val formatted = "%02d:%02d:%02d".format(h, m, s)

                // Update notification
                reactContext.startService(Intent(reactContext, AudioCaptureService::class.java))
                // Emit to JS
                sendEvent("onElapsed", formatted)

                elapsedHandler?.postDelayed(this, 1000)
              }
            }
    elapsedHandler?.postDelayed(runnable, 1000)
  }

  private fun stopElapsedTimer() {
    elapsedHandler?.removeCallbacksAndMessages(null)
    elapsedHandler = null
    elapsedSeconds = 0L
  }

  // ── EVENTS ────────────────────────────────────────────────────────────────

  private fun sendEvent(event: String, message: String) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, message)
  }

  private fun sendArrayEvent(event: String, data: WritableArray) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, data)
  }

  @ReactMethod fun addListener(eventName: String) {}

  @ReactMethod fun removeListeners(count: Int) {}
}

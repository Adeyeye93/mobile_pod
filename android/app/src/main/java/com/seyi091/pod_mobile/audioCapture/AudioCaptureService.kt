package com.seyi091.pod_mobile.audioCapture

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.support.v4.media.session.MediaSessionCompat
import androidx.core.app.NotificationCompat

class AudioCaptureService : Service() {

    companion object {
        const val CHANNEL_ID = "creator_stream_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_MUTE = "com.seyi091.pod_mobile.ACTION_MUTE"
        const val ACTION_END = "com.seyi091.pod_mobile.ACTION_END"
        const val EXTRA_TITLE = "stream_title"
    }

    private lateinit var mediaSession: MediaSessionCompat
    private var isMuted = false
    private var streamTitle = "Live Stream"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        mediaSession = MediaSessionCompat(this, "CreatorStream").apply { isActive = true }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_MUTE -> {
                isMuted = !isMuted
                // Tell the module to toggle mute
                AudioCaptureModule.instance?.toggleMute(isMuted)
                updateNotification()
            }
            ACTION_END -> {
                AudioCaptureModule.instance?.stopCaptureFromService()
                stopSelf()
            }
            else -> {
                streamTitle = intent?.getStringExtra(EXTRA_TITLE) ?: "Live Stream"
                startForeground(NOTIFICATION_ID, buildNotification())
            }
        }
        return START_NOT_STICKY
    }

    fun updateElapsed(elapsed: String) {
        updateNotification(elapsed)
    }

    private fun updateNotification(elapsed: String = "00:00:00") {
        val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildNotification(elapsed))
    }

    private fun buildNotification(elapsed: String = "00:00:00"): Notification {
        val muteIntent =
                PendingIntent.getService(
                        this,
                        0,
                        Intent(this, AudioCaptureService::class.java).apply {
                            action = ACTION_MUTE
                        },
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
        val endIntent =
                PendingIntent.getService(
                        this,
                        1,
                        Intent(this, AudioCaptureService::class.java).apply { action = ACTION_END },
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

        // Open app on tap
        val openIntent =
                packageManager.getLaunchIntentForPackage(packageName)?.let {
                    PendingIntent.getActivity(
                            this,
                            0,
                            it,
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                }

        return NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentTitle(streamTitle)
                .setContentText("🔴 Live · $elapsed")
                .setContentIntent(openIntent)
                .setOngoing(true)
                .setSilent(true)
                .addAction(
                        if (isMuted) android.R.drawable.ic_lock_silent_mode
                        else android.R.drawable.ic_lock_silent_mode_off,
                        if (isMuted) "Unmute" else "Mute",
                        muteIntent
                )
                .addAction(android.R.drawable.ic_delete, "End", endIntent)
                .setStyle(
                        androidx.media.app.NotificationCompat.MediaStyle()
                                .setMediaSession(mediaSession.sessionToken)
                                .setShowActionsInCompactView(0, 1)
                )
                .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel(CHANNEL_ID, "Live Stream", NotificationManager.IMPORTANCE_LOW)
                    .apply {
                        description = "Creator live stream controls"
                        setShowBadge(false)
                        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                                .createNotificationChannel(this)
                    }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        mediaSession.release()
        super.onDestroy()
    }
}

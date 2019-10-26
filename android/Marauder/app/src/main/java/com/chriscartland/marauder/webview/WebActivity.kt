package com.chriscartland.marauder.webview

import android.graphics.Point
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.webkit.WebView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.chriscartland.marauder.R
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Date


class WebActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var dimensionText: TextView
    private val HIDE_SYSTEM_UI_DELAY_MS: Long = 3000
    private val RESET_LOGICAL_ID: String = "reset"

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate")
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_web)
        webView = findViewById(R.id.webview)
        dimensionText = findViewById(R.id.dimension_text)
        logWindowDimensions()
        configureWebView()
    }

    override fun onStart() {
        super.onStart()
        Log.d(TAG, "onStart")
        watchForResetTrigger()
    }

    private var lastResetTimestamp: Timestamp? = null

    private fun watchForResetTrigger() {
        Log.d(TAG, "watchForResetTrigger")
        val nfcUpdates = FirebaseFirestore.getInstance()
            .collection("nfcUpdates")
            .whereGreaterThan("timestamp", Date())
        nfcUpdates.addSnapshotListener { snapshot, e ->
            Log.d(TAG, "watchForResetTrigger: nfcUpdates.addSnapshotListener")
            if (e != null) {
                Log.w(TAG, "Listen failed.", e)
                return@addSnapshotListener
            }

            if (snapshot != null && !snapshot.isEmpty) {
                Log.d(TAG, "watchForResetTrigger: Snapshot exists, looking at documents")
                snapshot.documents.forEach { document ->
                    Log.d(TAG, "watchForResetTrigger: Found a document")
                    val timestamp = document["timestamp"] as Timestamp?
                    if (timestamp == null) {
                        Log.d(TAG, "watchForResetTrigger: Igorning null timestamp")
                        return@forEach
                    }
                    val lastReset = lastResetTimestamp
                    if (lastReset != null && timestamp <= lastReset) {
                        Log.d(TAG, "watchForResetTrigger: Ignoring old reset, last $lastReset this $timestamp")
                        return@forEach
                    }
                    lastResetTimestamp = timestamp
                    val nfcData = document["nfcData"] as? Map<String, String>
                    val logicalId = nfcData?.get("nfcLogicalId")
                    if (logicalId == RESET_LOGICAL_ID) {
                        Log.d(TAG, "watchForResetTrigger: Logical ID is a reset request")
                        configureWebView()
                    } else {
                        Log.d(TAG, "watchForResetTrigger: Logical ID is not a reset request: $logicalId")
                    }
                }
            } else {
                Log.d(TAG, "watchForResetTrigger: Snapshot does not exist")
            }
        }
    }

    private fun logWindowDimensions() {
        val display = windowManager.defaultDisplay
        val size = Point()
        display.getSize(size)
        val width = size.x
        val height = size.y
        dimensionText.text = "Width: $width, Height: $height"
        Log.d(TAG, "logWindowDimensions: width $width, height $height")
    }

    private fun configureWebView() {
        Log.d(TAG, "configureWebView")
        webView.loadUrl(getString(R.string.marauder_web_app_url))
        webView.settings.javaScriptEnabled = true
        webView.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View, event: MotionEvent): Boolean {
                Log.d(TAG, "configureWebView: onTouch")
                delayHideUI()
                return false
            }
        })
    }

    private val hideSystemUiHandler = Handler()

    private fun delayHideUI() {
        // Always hide the system UI after 3 seconds.
        hideSystemUiHandler.removeCallbacksAndMessages(null)
        hideSystemUiHandler.postDelayed({
            hideSystemUI()
        }, HIDE_SYSTEM_UI_DELAY_MS)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        Log.d(TAG, "onWindowFocusChanged")
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    private fun hideSystemUI() {
        Log.d(TAG, "hideSystemUI")
        // Enables regular immersive mode.
        // For "lean back" mode, remove SYSTEM_UI_FLAG_IMMERSIVE.
        // Or for "sticky immersive," replace it with SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE
                // Set the content to appear under the system bars so that the
                // content doesn't resize when the system bars hide and show.
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                // Hide the nav bar and status bar
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN)
    }

    // Shows the system bars by removing all the flags
    // except for the ones that make the content appear under the system bars.
    private fun showSystemUI() {
        Log.d(TAG, "showSystemUI")
        window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                )
    }

    companion object {
        const val TAG = "WebActivity"
    }
}

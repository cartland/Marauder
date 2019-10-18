package com.chriscartland.marauder.webview

import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import com.chriscartland.marauder.R

class WebActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val HIDE_SYSTEM_UI_DELAY_MS: Long = 3000

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate")
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_web)
        // WebView
        webView = findViewById(R.id.webview)
        configureWebView()
    }

    private val hideSystemUiHandler = Handler()

    private fun configureWebView() {
        Log.d(TAG, "configureWebView")
        webView.loadUrl(getString(R.string.marauder_web_app_url))
        webView.settings.javaScriptEnabled = true
        webView.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View, event: MotionEvent): Boolean {
                Log.d(TAG, "configureWebView: onTouch")
                // Always hide the system UI after 3 seconds.
                hideSystemUiHandler.removeCallbacksAndMessages(null)
                hideSystemUiHandler.postDelayed({
                    hideSystemUI()
                }, HIDE_SYSTEM_UI_DELAY_MS)
                return false
            }
        })
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

package com.sifr.ruxspeed.ui

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.sifr.ruxspeed.service.ListenerService

/**
 * Main Activity — Full F-Manager Dashboard in WebView + RuxSpeed SMS Listener.
 *
 * Opens the F-Manager web app inside a native Android WebView.
 * Also starts the foreground SMS listener service in the background.
 * Users see an app icon, splash, and full-screen web experience — feels like a native app.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private val SMS_PERMISSION_CODE = 100

    // ══ CHANGE THIS TO YOUR PRODUCTION URL ══
    private val WEB_APP_URL = "https://f-manager.vercel.app"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Full-screen immersive + status bar color
        window.apply {
            statusBarColor = Color.parseColor("#065F46")
            navigationBarColor = Color.parseColor("#0a0a0a")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                setDecorFitsSystemWindows(true)
            }
        }

        // Layout: FrameLayout with WebView + ProgressBar
        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#0a0a0a"))
        }

        // Progress bar
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                8
            )
            isIndeterminate = false
            max = 100
            progressDrawable.setColorFilter(
                Color.parseColor("#0d9488"),
                android.graphics.PorterDuff.Mode.SRC_IN
            )
        }

        // WebView
        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                loadWithOverviewMode = true
                useWideViewPort = true
                setSupportZoom(false)
                builtInZoomControls = false
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                mediaPlaybackRequiresUserGesture = false
                userAgentString = settings.userAgentString + " FManagerApp/1.0"
            }

            setBackgroundColor(Color.parseColor("#0a0a0a"))

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    progressBar.visibility = View.VISIBLE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    progressBar.visibility = View.GONE
                    // Inject CSS to hide browser-specific UI elements
                    view?.evaluateJavascript("""
                        (function() {
                            var meta = document.querySelector('meta[name="viewport"]');
                            if (!meta) {
                                meta = document.createElement('meta');
                                meta.name = 'viewport';
                                document.head.appendChild(meta);
                            }
                            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                        })();
                    """.trimIndent(), null)
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    // Keep internal navigation in WebView, open external links in browser
                    return if (url.contains("f-manager") || url.contains("vercel.app") || url.contains("localhost")) {
                        false
                    } else {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        true
                    }
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    progressBar.progress = newProgress
                }

                // Handle file inputs (for image uploads)
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback = filePathCallback
                    val intent = fileChooserParams?.createIntent()
                    try {
                        startActivityForResult(intent, FILE_CHOOSER_CODE)
                    } catch (e: Exception) {
                        filePathCallback?.onReceiveValue(null)
                        this@MainActivity.filePathCallback = null
                    }
                    return true
                }
            }
        }

        root.addView(webView)
        root.addView(progressBar)
        setContentView(root)

        // Load the web app
        webView.loadUrl(WEB_APP_URL)

        // Request SMS permissions & start listener
        requestSmsPermission()
        requestBatteryOptimization()

        // Save default config if not set
        val prefs = getSharedPreferences("ruxspeed_config", MODE_PRIVATE)
        if (prefs.getString("api_url", "")?.isBlank() == true) {
            prefs.edit()
                .putString("api_url", "$WEB_APP_URL/api/webhooks/ruxspeed-sms")
                .apply()
        }

        // Start the SMS listener foreground service
        ListenerService.start(this)
    }

    // ── File Upload Handling ──
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_CODE = 200

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_CODE) {
            val results = if (resultCode == RESULT_OK && data != null) {
                data.data?.let { arrayOf(it) }
            } else null
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }

    // ── Back Button = WebView Back ──
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // ── Permissions ──
    private fun requestSmsPermission() {
        val perms = mutableListOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            perms.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        val needed = perms.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), SMS_PERMISSION_CODE)
        }
    }

    private fun requestBatteryOptimization() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    // Some OEMs block this
                }
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == SMS_PERMISSION_CODE) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Toast.makeText(this, "✅ RuxSpeed SMS listener activated!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

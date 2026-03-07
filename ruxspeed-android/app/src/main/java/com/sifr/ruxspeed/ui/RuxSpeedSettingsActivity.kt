package com.sifr.ruxspeed.ui

import android.content.Context
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.sifr.ruxspeed.RuxSpeedApp
import com.sifr.ruxspeed.service.ListenerService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Settings screen for configuring the RuxSpeed SMS listener.
 * Accessible from the app's menu or notification.
 */
class RuxSpeedSettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("ruxspeed_config", MODE_PRIVATE)
        val scrollView = ScrollView(this)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 64, 48, 48)
        }

        // Title
        layout.addView(TextView(this).apply {
            text = "⚙️ RuxSpeed SMS Settings"
            textSize = 22f
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 32)
        })

        // Store ID
        layout.addView(label("Store ID (from Dashboard)"))
        val storeIdInput = editText(prefs.getString("store_id", "") ?: "", "Your seller UUID")
        layout.addView(storeIdInput)

        // API URL
        layout.addView(label("Webhook URL"))
        val apiUrlInput = editText(prefs.getString("api_url", "") ?: "", "https://your-app.vercel.app/api/webhooks/ruxspeed-sms")
        layout.addView(apiUrlInput)

        // App Secret
        layout.addView(label("App Secret (optional)"))
        val secretInput = editText(prefs.getString("app_secret", "") ?: "", "secure_token")
        layout.addView(secretInput)

        // Stats
        val statsText = TextView(this).apply {
            textSize = 13f
            setPadding(0, 32, 0, 16)
        }
        layout.addView(statsText)
        updateStats(statsText)

        // Save button
        layout.addView(Button(this).apply {
            text = "💾  Save Settings"
            setPadding(0, 24, 0, 24)
            setOnClickListener {
                prefs.edit()
                    .putString("store_id", storeIdInput.text.toString().trim())
                    .putString("api_url", apiUrlInput.text.toString().trim())
                    .putString("app_secret", secretInput.text.toString().trim())
                    .apply()
                ListenerService.start(this@RuxSpeedSettingsActivity)
                Toast.makeText(this@RuxSpeedSettingsActivity, "Settings saved! ✅", Toast.LENGTH_SHORT).show()
                finish()
            }
        })

        scrollView.addView(layout)
        setContentView(scrollView)
    }

    private fun label(text: String): TextView = TextView(this).apply {
        this.text = text
        textSize = 13f
        setTypeface(null, android.graphics.Typeface.BOLD)
        setPadding(0, 24, 0, 8)
    }

    private fun editText(value: String, hint: String): EditText = EditText(this).apply {
        setText(value)
        setHint(hint)
        setSingleLine()
        textSize = 14f
        setPadding(24, 24, 24, 24)
    }

    private fun updateStats(tv: TextView) {
        CoroutineScope(Dispatchers.IO).launch {
            val dao = RuxSpeedApp.database.smsTransactionDao()
            val pending = dao.getPendingCount()
            val synced = dao.getSyncedCount()
            withContext(Dispatchers.Main) {
                tv.text = "📊 Pending: $pending  |  ✅ Synced: $synced"
            }
        }
    }
}

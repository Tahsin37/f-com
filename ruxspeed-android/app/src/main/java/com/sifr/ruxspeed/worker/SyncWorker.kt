package com.sifr.ruxspeed.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import com.sifr.ruxspeed.RuxSpeedApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

/**
 * WorkManager Worker that syncs pending SMS transactions to the F-Manager backend.
 *
 * Handles the "offline queue" problem:
 * - If phone has no internet when SMS arrives, transaction is saved locally
 * - WorkManager retries with exponential backoff until sync succeeds
 * - Constraints: requires network connectivity
 */
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "RuxSpeed-Sync"
        private const val WORK_NAME = "ruxspeed_sync"

        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context)
                .enqueueUniqueWork(WORK_NAME, ExistingWorkPolicy.REPLACE, request)
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val dao = RuxSpeedApp.database.smsTransactionDao()
            val pending = dao.getPending()

            if (pending.isEmpty()) {
                Log.i(TAG, "No pending transactions to sync.")
                return@withContext Result.success()
            }

            val prefs = applicationContext.getSharedPreferences("ruxspeed_config", Context.MODE_PRIVATE)
            val apiUrl = prefs.getString("api_url", "") ?: ""
            val appSecret = prefs.getString("app_secret", "") ?: ""

            if (apiUrl.isBlank()) {
                Log.w(TAG, "API URL not configured. Retrying later.")
                return@withContext Result.retry()
            }

            var allSynced = true

            for (txn in pending) {
                try {
                    val payload = JSONObject().apply {
                        put("store_id", txn.storeId)
                        put("app_secret", appSecret)
                        put("provider", txn.provider)
                        put("sender_number", txn.senderNumber ?: "")
                        put("trx_id", txn.trxId)
                        put("amount", txn.amount)
                        put("timestamp", txn.timestamp)
                    }

                    val success = postToWebhook(apiUrl, payload)

                    if (success) {
                        dao.updateStatus(txn.id, "synced")
                        Log.i(TAG, "Synced TrxID: ${txn.trxId}")
                    } else {
                        dao.updateStatus(txn.id, "failed")
                        allSynced = false
                        Log.w(TAG, "Failed to sync TrxID: ${txn.trxId}")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error syncing ${txn.trxId}: ${e.message}")
                    allSynced = false
                }
            }

            if (allSynced) Result.success() else Result.retry()
        } catch (e: Exception) {
            Log.e(TAG, "Sync worker failed: ${e.message}")
            Result.retry()
        }
    }

    private fun postToWebhook(apiUrl: String, payload: JSONObject): Boolean {
        val url = URL(apiUrl)
        val connection = url.openConnection() as HttpURLConnection

        return try {
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.doOutput = true
            connection.connectTimeout = 15000
            connection.readTimeout = 15000

            connection.outputStream.use { os ->
                os.write(payload.toString().toByteArray())
            }

            val responseCode = connection.responseCode
            Log.d(TAG, "Webhook response: $responseCode")
            responseCode in 200..299
        } catch (e: Exception) {
            Log.e(TAG, "HTTP error: ${e.message}")
            false
        } finally {
            connection.disconnect()
        }
    }
}

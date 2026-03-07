package com.sifr.ruxspeed.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.sifr.ruxspeed.RuxSpeedApp
import com.sifr.ruxspeed.data.SmsTransaction
import com.sifr.ruxspeed.worker.SyncWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * BroadcastReceiver that listens for incoming SMS from bKash/Nagad.
 *
 * Flow:
 * 1. Receive SMS_RECEIVED broadcast
 * 2. Validate sender (bKash = "bKash" or "16247", Nagad = "Nagad" or "16267")
 * 3. Parse TrxID and Amount using Regex
 * 4. Save to local Room DB
 * 5. Trigger WorkManager sync
 */
class SmsReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "RuxSpeed-SMS"

        // Valid sender identifiers
        private val BKASH_SENDERS = setOf("bkash", "16247", "bkash-payment")
        private val NAGAD_SENDERS = setOf("nagad", "16267")

        // Regex patterns for bKash
        // "You have received Tk 120.00 from 01711223344. TrxID: 8AB3X9Y..."
        private val AMOUNT_REGEX = Regex("""Tk\s*([\d,]+\.\d{2})""", RegexOption.IGNORE_CASE)
        private val TRXID_REGEX = Regex("""TrxID\s*:?\s*([A-Z0-9]+)""", RegexOption.IGNORE_CASE)
        private val SENDER_NUM_REGEX = Regex("""from\s*(01[3-9]\d{8})""", RegexOption.IGNORE_CASE)
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return

        for (sms in messages) {
            val sender = sms.displayOriginatingAddress?.lowercase() ?: continue
            val body = sms.messageBody ?: continue

            Log.d(TAG, "SMS from: $sender")

            // Step 2: Validate sender
            val provider = when {
                BKASH_SENDERS.any { sender.contains(it) } -> "bKash"
                NAGAD_SENDERS.any { sender.contains(it) } -> "Nagad"
                else -> {
                    Log.d(TAG, "Ignoring SMS from non-payment sender: $sender")
                    return
                }
            }

            Log.d(TAG, "Payment SMS detected from $provider: $body")

            // Step 3: Parse with Regex
            val amountMatch = AMOUNT_REGEX.find(body)
            val trxIdMatch = TRXID_REGEX.find(body)
            val senderNumMatch = SENDER_NUM_REGEX.find(body)

            val amount = amountMatch?.groupValues?.get(1)?.replace(",", "")?.toDoubleOrNull()
            val trxId = trxIdMatch?.groupValues?.get(1)
            val senderNumber = senderNumMatch?.groupValues?.get(1)

            if (amount == null || trxId == null) {
                Log.w(TAG, "Could not parse amount or TrxID from SMS: $body")
                return
            }

            Log.i(TAG, "Parsed — Provider: $provider, Amount: $amount, TrxID: $trxId, Sender: $senderNumber")

            // Step 4: Save to local database
            val storeId = getStoreId(context)
            if (storeId.isBlank()) {
                Log.w(TAG, "Store ID not configured. Skipping.")
                return
            }

            val transaction = SmsTransaction(
                storeId = storeId,
                trxId = trxId,
                amount = amount,
                senderNumber = senderNumber,
                provider = provider,
                timestamp = Instant.now().toString(),
                status = "pending"
            )

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    RuxSpeedApp.database.smsTransactionDao().insert(transaction)
                    Log.i(TAG, "Transaction saved locally: $trxId")

                    // Step 5: Trigger sync
                    SyncWorker.enqueue(context)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to save transaction: ${e.message}")
                }
            }
        }
    }

    private fun getStoreId(context: Context): String {
        val prefs = context.getSharedPreferences("ruxspeed_config", Context.MODE_PRIVATE)
        return prefs.getString("store_id", "") ?: ""
    }
}

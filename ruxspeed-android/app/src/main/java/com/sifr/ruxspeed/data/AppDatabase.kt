package com.sifr.ruxspeed.data

import androidx.room.*

/**
 * Room Entity for storing SMS transactions locally (offline queue).
 */
@Entity(tableName = "sms_transactions")
data class SmsTransaction(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "store_id") val storeId: String,
    @ColumnInfo(name = "trx_id") val trxId: String,
    @ColumnInfo(name = "amount") val amount: Double,
    @ColumnInfo(name = "sender_number") val senderNumber: String?,
    @ColumnInfo(name = "provider") val provider: String = "bKash",
    @ColumnInfo(name = "timestamp") val timestamp: String,
    @ColumnInfo(name = "status") val status: String = "pending" // pending, synced, failed
)

/**
 * DAO for local SMS transaction CRUD operations.
 */
@Dao
interface SmsTransactionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(transaction: SmsTransaction): Long

    @Query("SELECT * FROM sms_transactions WHERE status = 'pending' ORDER BY id ASC")
    suspend fun getPending(): List<SmsTransaction>

    @Query("UPDATE sms_transactions SET status = :status WHERE id = :id")
    suspend fun updateStatus(id: Long, status: String)

    @Query("SELECT COUNT(*) FROM sms_transactions WHERE status = 'pending'")
    suspend fun getPendingCount(): Int

    @Query("SELECT COUNT(*) FROM sms_transactions WHERE status = 'synced'")
    suspend fun getSyncedCount(): Int

    @Query("SELECT * FROM sms_transactions ORDER BY id DESC LIMIT 20")
    suspend fun getRecent(): List<SmsTransaction>
}

/**
 * Room Database.
 */
@Database(entities = [SmsTransaction::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun smsTransactionDao(): SmsTransactionDao
}

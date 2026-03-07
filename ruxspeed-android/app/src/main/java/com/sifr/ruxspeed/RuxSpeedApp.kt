package com.sifr.ruxspeed

import android.app.Application
import androidx.room.Room
import com.sifr.ruxspeed.data.AppDatabase

/**
 * RuxSpeed Application class.
 * Initializes the Room database for offline SMS transaction caching.
 */
class RuxSpeedApp : Application() {

    companion object {
        lateinit var database: AppDatabase
            private set
    }

    override fun onCreate() {
        super.onCreate()
        database = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "ruxspeed_db"
        ).fallbackToDestructiveMigration().build()
    }
}

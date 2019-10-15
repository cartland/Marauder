package com.chriscartland.marauder.nfcreader

import android.content.Context
import androidx.annotation.VisibleForTesting
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [NfcUpdate::class, CurrentLocation::class], version = 2)
abstract class NfcDatabase : RoomDatabase() {

    abstract fun nfcUpdateDao(): NfcUpdateDao

    companion object {

        @Volatile
        private var INSTANCE: NfcDatabase? = null

        @VisibleForTesting
        private val DATABASE_NAME = "nfc_update-db"

        fun getInstance(context: Context): NfcDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context.applicationContext).also {
                    INSTANCE = it
                }
            }

        /**
         * Set up the database configuration.
         * The SQLite database is only created when it's accessed for the first time.
         */
        private fun buildDatabase(appContext: Context): NfcDatabase {
            return Room.databaseBuilder(appContext, NfcDatabase::class.java, DATABASE_NAME)
                .fallbackToDestructiveMigration()
                .build()
        }
    }
}

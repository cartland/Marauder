package com.chriscartland.marauder.nfcreader

import android.content.Context
import androidx.annotation.VisibleForTesting
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [(ReaderLocation::class)], version = 1)
abstract class ReaderLocationDatabase : RoomDatabase() {

    abstract fun readerLocationDao(): ReaderLocationDao

    companion object {

        @Volatile
        private var INSTANCE: ReaderLocationDatabase? = null

        @VisibleForTesting
        private val DATABASE_NAME = "reader_location-db"

        fun getInstance(context: Context): ReaderLocationDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context.applicationContext).also {
                    INSTANCE = it
                }
            }

        /**
         * Set up the database configuration.
         * The SQLite database is only created when it's accessed for the first time.
         */
        private fun buildDatabase(appContext: Context): ReaderLocationDatabase {
            return Room.databaseBuilder(appContext, ReaderLocationDatabase::class.java, DATABASE_NAME)
                .fallbackToDestructiveMigration()
                .build()
        }
    }
}

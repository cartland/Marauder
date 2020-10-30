/*
 * Copyright 2019 Chris Cartland. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

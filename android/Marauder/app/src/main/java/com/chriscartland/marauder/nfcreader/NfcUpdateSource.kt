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

import java.util.concurrent.Executor

class NfcUpdateSource private constructor(
    private val executor: Executor,
    private val nfcDatabase: NfcDatabase
) {

    val nfcUpdate = nfcDatabase.nfcUpdateDao().getNfcUpdate()

    val currentLocation = nfcDatabase.nfcUpdateDao().getCurrentLocation()

    fun setNfcUpdate(nfcUpdate: NfcUpdate) {
        executor.execute {
            nfcDatabase.runInTransaction {
                // Delete existing data.
                nfcDatabase.nfcUpdateDao().delete()
                // Insert new data.
                nfcDatabase.nfcUpdateDao().insert(nfcUpdate)
            }
        }
    }

    fun setCurrentLocation(location: CurrentLocation) {
        executor.execute {
            nfcDatabase.runInTransaction {
                // Delete existing data.
                nfcDatabase.nfcUpdateDao().deleteCurrentLocation()
                // Insert new data.
                nfcDatabase.nfcUpdateDao().setCurrentLocation(location)
            }
        }
    }

    companion object {

        @Volatile
        private var INSTANCE: NfcUpdateSource? = null

        fun getInstance(executor: Executor, database: NfcDatabase): NfcUpdateSource =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: NfcUpdateSource(executor, database).also {
                    INSTANCE = it }
            }
    }
}

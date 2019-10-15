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

    fun setLocation(location: CurrentLocation) {
        executor.execute {
            nfcDatabase.runInTransaction {
                // Delete existing data.
                nfcDatabase.nfcUpdateDao().deleteLocation()
                // Insert new data.
                nfcDatabase.nfcUpdateDao().setLocation(location)
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

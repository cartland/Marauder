package com.chriscartland.marauder.nfcreader

import java.util.concurrent.Executor

class NfcUpdateSource private constructor(
    private val executor: Executor,
    private val nfcDatabase: NfcDatabase
) {

    val nfcUpdate = nfcDatabase.readerLocationDao().getNfcUpdate()

    fun setNfcUpdate(nfcUpdate: NfcUpdate) {
        executor.execute {
            nfcDatabase.runInTransaction {
                // Delete existing data.
                nfcDatabase.readerLocationDao().delete()
                // Insert new data.
                nfcDatabase.readerLocationDao().insert(nfcUpdate)
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

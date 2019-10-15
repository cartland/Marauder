package com.chriscartland.marauder.nfcreader

import java.util.concurrent.Executor

class LocalReaderLocationSource private constructor(
    private val executor: Executor,
    private val readerLocationDatabase: ReaderLocationDatabase
) {

    val location = readerLocationDatabase.readerLocationDao().getLocation()

    fun setLocation(location: ReaderLocation) {
        executor.execute {
            readerLocationDatabase.runInTransaction {
                // Delete existing data.
                readerLocationDatabase.readerLocationDao().delete()
                // Insert new data.
                readerLocationDatabase.readerLocationDao().insert(location)
            }
        }
    }

    companion object {

        @Volatile
        private var INSTANCE: LocalReaderLocationSource? = null

        fun getInstance(executor: Executor, database: ReaderLocationDatabase): LocalReaderLocationSource =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: LocalReaderLocationSource(executor, database).also {
                    INSTANCE = it }
            }
    }
}

package com.chriscartland.marauder

import android.app.Application
import com.chriscartland.marauder.nfcreader.LocalReaderLocationSource
import com.chriscartland.marauder.nfcreader.ReaderLocationDatabase
import com.chriscartland.marauder.nfcreader.ReaderLocationRepository
import java.util.concurrent.Executors

class MarauderApp : Application() {

    private val diskIO = Executors.newSingleThreadExecutor()

    private val database: ReaderLocationDatabase
        get() = ReaderLocationDatabase.getInstance(this)

    private val localReaderLocationSource: LocalReaderLocationSource
        get() = LocalReaderLocationSource.getInstance(diskIO, database)

    val repository: ReaderLocationRepository
        get() = ReaderLocationRepository.getInstance(localReaderLocationSource)
}

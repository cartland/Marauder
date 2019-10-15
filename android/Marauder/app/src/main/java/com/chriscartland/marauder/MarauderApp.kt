package com.chriscartland.marauder

import android.app.Application
import com.chriscartland.marauder.nfcreader.NfcUpdateSource
import com.chriscartland.marauder.nfcreader.NfcDatabase
import com.chriscartland.marauder.nfcreader.NfcUpdateRepository
import java.util.concurrent.Executors

class MarauderApp : Application() {

    private val diskIO = Executors.newSingleThreadExecutor()

    private val database: NfcDatabase
        get() = NfcDatabase.getInstance(this)

    private val nfcUpdateSource: NfcUpdateSource
        get() = NfcUpdateSource.getInstance(diskIO, database)

    val repository: NfcUpdateRepository
        get() = NfcUpdateRepository.getInstance(nfcUpdateSource)
}

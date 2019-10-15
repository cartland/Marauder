package com.chriscartland.marauder.nfcreader

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MediatorLiveData
import com.chriscartland.marauder.MarauderApp

class NfcUpdateViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val repository: NfcUpdateRepository = (application as MarauderApp).repository

    val location = MediatorLiveData<String?>()
    val nfcLogicalId = MediatorLiveData<String?>()
    val nfcUri = MediatorLiveData<String?>()

    init {
        location.addSource(repository.nfcUpdate) {
            location.value = it?.nfcReaderLocation
        }
        nfcLogicalId.addSource(repository.nfcUpdate) {
            nfcLogicalId.value = it?.nfcLogicalId
        }
        nfcUri.addSource(repository.nfcUpdate) {
            nfcUri.value = it?.nfcUri
        }
    }

    fun setNfcUpdate(nfcUpdate: NfcUpdate) = repository.setNfcUpdate(nfcUpdate)

    fun setLocation(location: String?) = repository.setLocation(location)
}
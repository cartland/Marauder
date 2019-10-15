package com.chriscartland.marauder.nfcreader

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MediatorLiveData
import androidx.lifecycle.MutableLiveData
import com.chriscartland.marauder.MarauderApp
import com.google.firebase.Timestamp

class NfcUpdateViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val repository: NfcUpdateRepository = (application as MarauderApp).repository

    val currentLocation = repository.currentLocation

    val currentLocationLabel = MediatorLiveData<String?>()

    val timestampString = MutableLiveData<String?>()

    val nfcLocation = MediatorLiveData<String?>()
    val nfcLogicalId = MediatorLiveData<String?>()
    val nfcUri = MediatorLiveData<String?>()

    init {
        currentLocationLabel.addSource(currentLocation) {
            currentLocationLabel.value = currentLocation.value?.location
        }
        nfcLocation.addSource(repository.nfcUpdate) {
            nfcLocation.value = it?.nfcReaderLocation
        }
        nfcLogicalId.addSource(repository.nfcUpdate) {
            nfcLogicalId.value = it?.nfcLogicalId
        }
        nfcUri.addSource(repository.nfcUpdate) {
            nfcUri.value = it?.nfcUri
        }
    }

    fun setNfcUpdate(nfcUpdate: NfcUpdate) = repository.setNfcUpdate(nfcUpdate)

    fun setCurrentLocation(location: CurrentLocation) = repository.setCurrentLocation(location)

    fun setTimestamp(timestamp: Timestamp?) {
        timestampString.value = timestamp?.toDate().toString()
    }
}

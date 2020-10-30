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

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MediatorLiveData
import com.chriscartland.marauder.MarauderApp
import com.google.firebase.Timestamp
import java.text.SimpleDateFormat
import java.util.Locale

class NfcUpdateViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val repository: NfcUpdateRepository = (application as MarauderApp).repository

    val currentLocation = repository.currentLocation

    val currentLocationString = MediatorLiveData<String?>()

    val nfcUri = MediatorLiveData<String?>()
    val nfcLogicalId = MediatorLiveData<String?>()
    val nfcLocation = MediatorLiveData<String?>()
    val timestampString = MediatorLiveData<String?>()

    init {
        currentLocationString.addSource(currentLocation) {
            currentLocationString.value = currentLocation.value?.location
        }
        nfcUri.addSource(repository.nfcUpdate) {
            nfcUri.value = it?.nfcUri
        }
        nfcLogicalId.addSource(repository.nfcUpdate) {
            nfcLogicalId.value = it?.nfcLogicalId
        }
        nfcLocation.addSource(repository.nfcUpdate) {
            nfcLocation.value = it?.nfcReaderLocation
        }
        timestampString.addSource(repository.nfcUpdate) {
            timestampString.value = it?.timestamp
        }
    }

    fun setNfcUpdate(nfcUpdate: NfcUpdate) = repository.setNfcUpdate(nfcUpdate)

    fun setCurrentLocation(location: CurrentLocation) = repository.setCurrentLocation(location)

    fun setTimestamp(timestamp: Timestamp?) {
        val ISO_8601_DATE = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ", Locale.US)
        val date = timestamp?.toDate()
        val formattedDate = ISO_8601_DATE.format(date)
        val nfcUpdate = repository.nfcUpdate.value ?: NfcUpdate()
        nfcUpdate.timestamp = formattedDate
        setNfcUpdate(nfcUpdate)
    }
}

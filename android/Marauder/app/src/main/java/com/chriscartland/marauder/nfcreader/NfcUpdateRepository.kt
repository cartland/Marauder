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

class NfcUpdateRepository private constructor(
    private val nfcUpdateSource: NfcUpdateSource
) {

    val nfcUpdate = nfcUpdateSource.nfcUpdate

    val currentLocation = nfcUpdateSource.currentLocation

    fun setNfcUpdate(nfcUpdate: NfcUpdate) = nfcUpdateSource.setNfcUpdate(nfcUpdate)

    fun setCurrentLocation(location: CurrentLocation) = nfcUpdateSource.setCurrentLocation(location)

    companion object {

        @Volatile
        private var INSTANCE: NfcUpdateRepository? = null

        fun getInstance(nfcUpdateSource: NfcUpdateSource): NfcUpdateRepository =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: NfcUpdateRepository(nfcUpdateSource).also {
                    INSTANCE = it }
            }
    }
}

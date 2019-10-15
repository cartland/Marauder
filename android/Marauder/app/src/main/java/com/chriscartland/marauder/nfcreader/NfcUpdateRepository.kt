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

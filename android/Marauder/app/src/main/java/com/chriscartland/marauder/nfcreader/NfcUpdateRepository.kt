package com.chriscartland.marauder.nfcreader

class NfcUpdateRepository private constructor(
    private val nfcUpdateSource: NfcUpdateSource
) {

    val nfcUpdate = nfcUpdateSource.nfcUpdate

    val currentLocation = nfcUpdateSource.currentLocation

    fun setNfcUpdate(nfcUpdate: NfcUpdate) = nfcUpdateSource.setNfcUpdate(nfcUpdate)

    fun setLocation(location: String?) {
        val currentLocation = CurrentLocation(location = location)
        nfcUpdateSource.setLocation(currentLocation)
    }

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

package com.chriscartland.marauder.nfcreader

class NfcUpdateRepository private constructor(
    private val nfcUpdateSource: NfcUpdateSource
) {

    val nfcUpdate = nfcUpdateSource.nfcUpdate

    fun setNfcUpdate(nfcUpdate: NfcUpdate) = nfcUpdateSource.setNfcUpdate(nfcUpdate)

    fun setLocation(location: String?) {
        val update = nfcUpdate.value ?: NfcUpdate()
        update.nfcReaderLocation = location
        setNfcUpdate(update)
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

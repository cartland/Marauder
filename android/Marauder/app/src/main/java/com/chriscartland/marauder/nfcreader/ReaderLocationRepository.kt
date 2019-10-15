package com.chriscartland.marauder.nfcreader

class ReaderLocationRepository private constructor(
    private val localReaderLocationSource: LocalReaderLocationSource
) {

    val location = localReaderLocationSource.location

    fun setLocation(location: ReaderLocation) = localReaderLocationSource.setLocation(location)

    companion object {

        @Volatile
        private var INSTANCE: ReaderLocationRepository? = null

        fun getInstance(localReaderLocationSource: LocalReaderLocationSource): ReaderLocationRepository =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: ReaderLocationRepository(localReaderLocationSource).also {
                    INSTANCE = it }
            }
    }
}

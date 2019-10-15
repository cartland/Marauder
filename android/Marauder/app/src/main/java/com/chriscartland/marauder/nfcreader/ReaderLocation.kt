package com.chriscartland.marauder.nfcreader

import androidx.room.Entity

@Entity(tableName = "reader_location")
data class ReaderLocation (
    var readerLocation: String? = null
)

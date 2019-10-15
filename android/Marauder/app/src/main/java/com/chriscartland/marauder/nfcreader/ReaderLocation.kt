package com.chriscartland.marauder.nfcreader

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reader_location")
data class ReaderLocation (
    @PrimaryKey(autoGenerate = true)
    var primaryKey: Int = 0,
    var readerLocation: String? = null
)

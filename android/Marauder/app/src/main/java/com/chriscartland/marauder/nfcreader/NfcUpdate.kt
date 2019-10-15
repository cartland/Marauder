package com.chriscartland.marauder.nfcreader

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "nfc_update")
data class NfcUpdate (
    @PrimaryKey(autoGenerate = true)
    var primaryKey: Int = 0,
    var nfcReaderLocation: String? = null,
    val nfcUri: String? = null,
    val nfcLogicalId: String? = null,
    var timestamp: String? = null
)

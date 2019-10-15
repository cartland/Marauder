package com.chriscartland.marauder.nfcreader

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "current_location")
data class CurrentLocation (
    @PrimaryKey(autoGenerate = true)
    var primaryKey: Int = 0,
    var location: String? = null,
    var spinnerIndex: Int? = null
)

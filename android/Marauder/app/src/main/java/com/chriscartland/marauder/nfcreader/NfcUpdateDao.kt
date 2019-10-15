package com.chriscartland.marauder.nfcreader

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface NfcUpdateDao {
    @Query("SELECT * FROM nfc_update LIMIT 1")
    fun getNfcUpdate(): LiveData<NfcUpdate?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insert(comments: NfcUpdate)

    @Query("DELETE FROM nfc_update")
    fun delete()

    @Query("SELECT * FROM current_location LIMIT 1")
    fun getCurrentLocation(): LiveData<CurrentLocation?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun setCurrentLocation(comments: CurrentLocation)

    @Query("DELETE FROM current_location")
    fun deleteCurrentLocation()
}

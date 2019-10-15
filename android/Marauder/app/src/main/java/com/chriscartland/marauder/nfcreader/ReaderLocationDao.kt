package com.chriscartland.marauder.nfcreader

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface ReaderLocationDao {
    @Query("SELECT * FROM reader_location LIMIT 1")
    fun getLocation(): LiveData<ReaderLocation?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insert(comments: ReaderLocation)

    @Query("DELETE FROM reader_location")
    fun delete()
}

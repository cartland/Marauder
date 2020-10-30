/*
 * Copyright 2019 Chris Cartland. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

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

package com.chriscartland.marauder

import android.app.Application
import com.chriscartland.marauder.nfcreader.NfcUpdateSource
import com.chriscartland.marauder.nfcreader.NfcDatabase
import com.chriscartland.marauder.nfcreader.NfcUpdateRepository
import java.util.concurrent.Executors

class MarauderApp : Application() {

    private val diskIO = Executors.newSingleThreadExecutor()

    private val database: NfcDatabase
        get() = NfcDatabase.getInstance(this)

    private val nfcUpdateSource: NfcUpdateSource
        get() = NfcUpdateSource.getInstance(diskIO, database)

    val repository: NfcUpdateRepository
        get() = NfcUpdateRepository.getInstance(nfcUpdateSource)
}

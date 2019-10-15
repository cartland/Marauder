package com.chriscartland.marauder.nfcreader

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.chriscartland.marauder.MarauderApp

class ReaderLocationViewModel(
    application: Application
) : AndroidViewModel(application) {

    private val repository: ReaderLocationRepository = (application as MarauderApp).repository

    val location = repository.location

    fun setLocation(location: ReaderLocation) = repository.setLocation(location)
}

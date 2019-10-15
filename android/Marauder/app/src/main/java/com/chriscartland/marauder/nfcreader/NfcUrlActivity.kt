package com.chriscartland.marauder.nfcreader

import android.content.Intent
import android.os.Bundle
import android.os.PersistableBundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProviders
import com.chriscartland.marauder.BuildConfig
import com.chriscartland.marauder.R
import com.chriscartland.marauder.databinding.ActivityNfcUrlBinding
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import java.util.UUID

class NfcUrlActivity : AppCompatActivity() {

    private val nfcUpdates = FirebaseFirestore.getInstance().collection("nfcUpdates")
    private lateinit var nfcUpdateViewModel: NfcUpdateViewModel
    private var uuid: String? = null
    lateinit var spinnerNfcReaderLocation: Spinner

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate")
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_nfc_url)
        nfcUpdateViewModel = ViewModelProviders.of(this).get(NfcUpdateViewModel::class.java)
        val binding: ActivityNfcUrlBinding = DataBindingUtil.setContentView(this, R.layout.activity_nfc_url)
        binding.setLifecycleOwner(this)
        binding.nfcViewModel = nfcUpdateViewModel

        // Find views.
        spinnerNfcReaderLocation = findViewById(R.id.spinner_nfc_reader_location)
        spinnerNfcReaderLocation.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onNothingSelected(parent: AdapterView<*>?) {
                nfcUpdateViewModel.setLocation(null)
            }
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                nfcUpdateViewModel.setLocation(spinnerNfcReaderLocation.getItemAtPosition(position) as String)
            }
        }
        // Restore basic state.
        restoreInstanceState(savedInstanceState)
        // Handle the Intent with NFC data.
        onNewIntent(intent)
    }

    fun restoreInstanceState(savedInstanceState: Bundle?) {
        Log.d(TAG, "onRestoreInstanceState")
        uuid = savedInstanceState?.getString(UUID_KEY)
        if (uuid == null) {
            Log.d(TAG, "onRestoreInstanceState: randomUUID()")
            uuid = UUID.randomUUID().toString()
        }
    }

    override fun onSaveInstanceState(outState: Bundle?, outPersistentState: PersistableBundle?) {
        Log.d(TAG, "onSaveInstanceState")
        val out = outState ?: Bundle()
        val persistableOut = outPersistentState ?: PersistableBundle()
        out.run {
            putString(UUID_KEY, uuid)
        }
        super.onSaveInstanceState(out, persistableOut)
    }

    override fun onNewIntent(intent: Intent?) {
        Log.d(TAG, "onNewIntent")
        super.onNewIntent(intent)
        if (intent == null) {
            Log.d(TAG, "onNewIntent: No Intent")
        } else {
            Log.d(TAG, "onNewIntent: Found Intent")
            val update = extractData(intent)
            val nfcUri = (update["nfcData"] as HashMap<String, String?>)["nfcUri"]
            if (nfcUri == null) {
                Log.d(TAG, "onNewIntent: No URI found, will not publish data")
            } else {
                Log.d(TAG, "onNewIntent: Publishing data for URI: $nfcUri")
                publishData(update)
            }
            // Update views.
            displayData(update)
        }
    }

    private fun extractData(intent: Intent): HashMap<String, Any?> {
        Log.d(TAG, "extractData")
        // Extract NFC data.
        val data = intent.data
        val nfcUpdate = NfcUpdate(
            nfcUri = data?.toString(),
            nfcLogicalId = data?.getQueryParameter("logicalid"),
            nfcReaderLocation = nfcUpdateViewModel.location.value
        )
        val nfcData = hashMapOf(
            "nfcUri" to nfcUpdate.nfcUri,
            "nfcLogicalId" to nfcUpdate.nfcLogicalId,
            "nfcReaderLocation" to nfcUpdate.nfcReaderLocation
        )
        // Debug app data.
        val zPhone = hashMapOf(
            "zPhoneModel" to android.os.Build.MODEL,
            "zPhoneUUID" to uuid
        )
        // Debug phone data.
        val zApp = hashMapOf(
            "zAppVersionCode" to BuildConfig.VERSION_CODE,
            "zAppVersionName" to BuildConfig.VERSION_NAME
        )
        // Put all data in update.
        val update: HashMap<String, Any?> = hashMapOf(
            "nfcData" to nfcData,
            "timestamp" to FieldValue.serverTimestamp(),
            "zApp" to zApp, // Debug app data.
            "zPhone" to zPhone // Debug phone data.
        )
        return update
    }

    private fun publishData(update: HashMap<String, Any?>) {
        // Publish update to Firebase.
        Log.d(TAG, "publishData: Write to Firestore")
        nfcUpdates.document().set(update)
            .addOnSuccessListener {
                Log.d(TAG, "publishData: DocumentSnapshot successfully written!")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "publishData: Error writing document", e)
            }
            .addOnCanceledListener {
                Log.w(TAG, "publishData: Write canceled")
            }
    }

    private fun displayData(update: HashMap<String, Any?>) {
        val nfcUpdate = update.toNfcUpdate()
        Log.d(TAG, "displayData")
        Log.d(TAG, JSONObject(update).toString())
        val timestamp: String? = update["timestamp"]?.toString()
        (this.findViewById(R.id.timestamp) as TextView).text = getString(R.string.timestamp_label, timestamp)
        nfcUpdateViewModel.setNfcUpdate(nfcUpdate)
    }

    companion object {
        const val TAG = "NfcUrlActivity"
        const val UUID_KEY: String = "com.chriscartland.marauder.UUID_KEY"
    }
}

private fun <K, V> java.util.HashMap<K, V>.toNfcUpdate(): NfcUpdate {
    val update = this as? HashMap<String, HashMap<String, String?>>
    val nfcUri: String? = update?.get("nfcData")?.get("nfcUri")
    val nfcLogicalId: String? = update?.get("nfcData")?.get("nfcLogicalId")
    val nfcReaderLocation: String? = update?.get("nfcData")?.get("nfcReaderLocation")
    return NfcUpdate(
        nfcUri = nfcUri,
        nfcLogicalId = nfcLogicalId,
        nfcReaderLocation = nfcReaderLocation
    )
}

package com.chriscartland.marauder.nfcreader

import android.content.Intent
import android.os.Bundle
import android.os.PersistableBundle
import android.util.Log
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.chriscartland.marauder.BuildConfig
import com.chriscartland.marauder.R
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import java.util.UUID

class NfcUrlActivity : AppCompatActivity() {

    private val nfcUpdates = FirebaseFirestore.getInstance().collection("nfcUpdates")
    private var uuid: String? = null
    lateinit var spinnerNfcReaderLocation: Spinner

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate")
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_nfc_url)
        // Find views.
        spinnerNfcReaderLocation = findViewById(R.id.spinner_nfc_reader_location)
        // Restore basic state.
        restoreInstanceState(savedInstanceState)
        // Handle the Intent with NFC data.
        onNewIntent(intent)
    }

    fun restoreInstanceState(savedInstanceState: Bundle?) {
        Log.d(TAG, "onRestoreInstanceState")
        uuid = savedInstanceState?.getString(UUID_KEY)
        savedInstanceState?.getInt(NFC_READER_LOCATION_KEY)?.let {
            spinnerNfcReaderLocation.setSelection(it)
        }
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
            putInt(NFC_READER_LOCATION_KEY, spinnerNfcReaderLocation.selectedItemPosition)
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
        val nfcUri: String? = data?.toString()
        val nfcLogicalId = data?.getQueryParameter("logicalid")
        val nfcReaderLocation = spinnerNfcReaderLocation.selectedItem
        val nfcData = hashMapOf(
            "nfcUri" to nfcUri,
            "nfcLogicalId" to nfcLogicalId,
            "nfcReaderLocation" to nfcReaderLocation
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
        Log.d(TAG, "displayData")
        Log.d(TAG, JSONObject(update).toString())
        val nfcUri: String? = (update["nfcData"] as HashMap<String, String?>)["nfcUri"]
        val nfcLogicalId: String? = (update["nfcData"] as HashMap<String, String?>)["nfcLogicalId"]
        val nfcReaderLocation: String? = (update["nfcData"] as HashMap<String, String?>)["nfcReaderLocation"]
        val timestamp: String? = update["timestamp"]?.toString()
        (this.findViewById(R.id.nfc_uri) as TextView).text = getString(R.string.nfc_label, nfcUri)
        (this.findViewById(R.id.nfc_logical_id) as TextView).text = getString(R.string.nfc_logical_label, nfcLogicalId)
        (this.findViewById(R.id.nfc_reader_location_text) as TextView).text =
            getString(R.string.nfc_reader_label, nfcReaderLocation)
        (this.findViewById(R.id.timestamp) as TextView).text = getString(R.string.timestamp_label, timestamp)
    }

    companion object {
        const val TAG = "NfcUrlActivity"
        const val UUID_KEY: String = "com.chriscartland.marauder.UUID_KEY"
        const val NFC_READER_LOCATION_KEY: String = "com.chriscartland.marauder.NFC_READER_LOCATION_KEY"
    }
}

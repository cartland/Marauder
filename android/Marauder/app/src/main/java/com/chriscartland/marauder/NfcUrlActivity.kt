package com.chriscartland.marauder

import android.content.Intent
import android.os.Bundle
import android.os.PersistableBundle
import android.util.Log
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import java.util.UUID

class NfcUrlActivity : AppCompatActivity() {

    private val db = FirebaseFirestore.getInstance()
    private var uuid: String? = null
    lateinit var spinnerNfcReaderLocation: Spinner

    override fun onCreate(savedInstanceState: Bundle?) {
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
            publishNfcUpdate(intent)
        }
    }

    private fun publishNfcUpdate(intent: Intent) {
        Log.d(TAG, "publishNfcUpdate")
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
        Log.d(TAG, JSONObject(update).toString())
        // Publish update to Firebase.
        Log.d(TAG, "publishNfcUpdate: Write to Firestore")
        db.collection("nfcUpdates").document().set(update)
            .addOnSuccessListener {
                Log.d(TAG, "publishNfcUpdate: DocumentSnapshot successfully written!")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "publishNfcUpdate: Error writing document", e)
            }
            .addOnCanceledListener {
                Log.w(TAG, "publishNfcUpdate: Write canceled")
            }
        // Update views.
        displayData(update)
    }

    private fun displayData(update: HashMap<String, Any?>) {
        var nfcUri: String? = null // ["nfcUri"]
        var nfcLogicalId: String? = null // update["nfcData"]["nfcLogicalId"]
        var nfcReaderLocation: String? = null // spinnerNfcReaderLocation.selectedItem
        val timestamp: String? = update["timestamp"]?.toString()

        val nfcData = update["nfcData"] as HashMap<String, String?>?
        nfcData?.run {
            nfcUri = this["nfcUri"]
            nfcLogicalId = this["nfcLogicalId"]
            nfcReaderLocation = this["nfcReaderLocation"]
        }
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

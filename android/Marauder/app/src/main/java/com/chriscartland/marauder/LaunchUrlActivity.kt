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

class LaunchUrlActivity : AppCompatActivity() {

    private val db = FirebaseFirestore.getInstance()
    private var uuid: String? = null
    lateinit var spinnerNfcReaderLocation: Spinner
    lateinit var nfcUriTextView: TextView
    lateinit var nfcTagIdTextView: TextView
    lateinit var nfcLogicalIdTextView: TextView
    lateinit var timestampTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_launch_url)
        // Find views.
        spinnerNfcReaderLocation = findViewById(R.id.spinner_nfc_reader_location)
        nfcUriTextView = findViewById(R.id.nfc_uri)
        nfcTagIdTextView = findViewById(R.id.nfc_tag_id)
        nfcLogicalIdTextView = findViewById(R.id.nfc_logical_id)
        timestampTextView = findViewById(R.id.timestamp)

        restoreInstanceState(savedInstanceState)
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
        val nfcTagId = data?.getQueryParameter("tagid")
        val nfcLogicalId = data?.getQueryParameter("logicalid")
        val nfcData = hashMapOf(
            "nfcUri" to nfcUri,
            "nfcTagId" to nfcTagId,
            "nfcLogicalId" to nfcLogicalId,
            "nfcReaderLocation" to spinnerNfcReaderLocation.selectedItem
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
        // Publish update to Firebase.
        db.collection("nfcUpdates").document().set(update)
        Log.d(TAG, JSONObject(update).toString())
        // Update views.
        val timestamp = update["timestamp"]?.toString()
        nfcUriTextView.text = "NFC URI: $nfcUri"
        nfcTagIdTextView.text = "NFC Tag ID: $nfcTagId"
        nfcLogicalIdTextView.text = "NFC Logical ID: $nfcLogicalId"
        timestampTextView.text = "Timestamp: $timestamp"
    }

    companion object {
        const val TAG = "LaunchUrlActivity"
        const val UUID_KEY: String = "com.chriscartland.marauder.UUID_KEY"
        const val NFC_READER_LOCATION_KEY: String = "com.chriscartland.marauder.NFC_READER_LOCATION_KEY"
    }
}

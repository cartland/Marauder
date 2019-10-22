package com.chriscartland.marauder.nfcreader

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.PersistableBundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.Spinner
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.chriscartland.marauder.BuildConfig
import com.chriscartland.marauder.R
import com.chriscartland.marauder.databinding.ActivityNfcUrlBinding
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import java.util.UUID


class NfcUrlActivity : AppCompatActivity() {

    private val nfcUpdates = FirebaseFirestore.getInstance().collection("nfcUpdates")
    private lateinit var nfcUpdateViewModel: NfcUpdateViewModel
    private var uuid: String? = null
    lateinit var spinnerNfcReaderLocation: Spinner
    lateinit var setLocationButton: Button
    private var dialog: AlertDialog? = null

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
        nfcUpdateViewModel.currentLocation.observe(this, Observer<CurrentLocation?> {
            it?.spinnerIndex?.let {
                spinnerNfcReaderLocation.setSelection(it)
            }
        })
        setLocationButton = findViewById(R.id.set_location_button)
        setLocationButton.setOnClickListener {
            val selectedSpinnerLocation = spinnerNfcReaderLocation.selectedItem as String?
            val selectedSpinnerIndex = spinnerNfcReaderLocation.selectedItemPosition
            dialog = AlertDialog.Builder(this)
                .setTitle("Confirm Location Change")
                .setMessage("Do you want to change location to $selectedSpinnerLocation?")
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton(android.R.string.yes) { _, _ ->
                    nfcUpdateViewModel.setCurrentLocation(CurrentLocation(
                        location = selectedSpinnerLocation,
                        spinnerIndex = selectedSpinnerIndex
                    ))
                }
                .setNegativeButton(android.R.string.no, null).show()
        }
        val contentView: View = findViewById(R.id.constraint_layout)
        contentView.setOnClickListener {
            delayHideUI()
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
        dialog?.dismiss()
        nfcUpdateViewModel.currentLocation.value?.let {
            it.spinnerIndex?.let {
                spinnerNfcReaderLocation.setSelection(it)
            }
        }
        if (intent == null) {
            Log.d(TAG, "onNewIntent: No Intent")
            return
        }
        publishFromIntent(intent)
    }

    private fun publishFromIntent(intent: Intent, previousAttempts: Int = 0) {
        Log.d(TAG, "publishFromIntent: Attempt ${previousAttempts + 1}")
        val update = extractData(intent)
        val nfcUri = (update["nfcData"] as HashMap<String, String?>)["nfcUri"]
        if (nfcUri == null) {
            Log.d(TAG, "publishFromIntent: No URI found, will not publish data")
            return
        }

        // When the app opens on a cold-start, the location information is not ready from the Android database.
        // TODO: Block the current operation until the database information is ready.
        // Current workaround: Try again with exponential backoff.
        Log.d(TAG, "publishFromIntent: Trying to publish data for URI: $nfcUri")
        val nfcReaderLocation = update.toNfcUpdate().nfcReaderLocation
        if (nfcReaderLocation == null) {
            if (previousAttempts > REPEAT_NFC_ATTEMPT_MAX) {
                Log.e(TAG, "publishFromIntent: Location data not found after $REPEAT_NFC_ATTEMPT_MAX attempts")
                return
            }
            // This delay is exponential backoff.
            val delay = REPEAT_NFC_ATTEMPT_MIN_DELAY_MS * Math.pow(2.0, previousAttempts.toDouble()).toLong()
            Log.w(TAG, "publishFromIntent: Waiting ${delay}ms to try again")
            waitForViewModelHandler.removeCallbacksAndMessages(null)
            waitForViewModelHandler.postDelayed({
                Log.d(TAG, "publishFromIntent: Initiating attempt ${previousAttempts + 2} for data")
                publishFromIntent(intent, previousAttempts + 1)
            }, delay)
            return
        }
        Log.d(TAG, "publishFromIntent: Publishing data!")
        publishData(update)
    }

    private val waitForViewModelHandler = Handler()

    private fun extractData(intent: Intent): HashMap<String, Any?> {
        Log.d(TAG, "extractData")
        // Extract NFC data.
        val data = intent.data
        val nfcReaderLocation = nfcUpdateViewModel.currentLocationString.value
        val nfcUpdate = NfcUpdate(
            nfcUri = data?.toString(),
            nfcLogicalId = data?.getQueryParameter("logicalid"),
            nfcReaderLocation = nfcReaderLocation
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

    private fun publishData(updateData: HashMap<String, Any?>) {
        // Publish updateData to Firebase.
        Log.d(TAG, "publishData: Write to Firestore")
        val id = nfcUpdates.document().id
        nfcUpdates.document(id).set(updateData)
            .addOnSuccessListener {
                Log.d(TAG, "publishData: DocumentSnapshot successfully written!")
                nfcUpdates.document(id).get().addOnSuccessListener { doc ->
                    val timestamp = doc?.data?.get("timestamp") as Timestamp?
                    nfcUpdateViewModel.setTimestamp(timestamp)
                }
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "publishData: Error writing document", e)
            }
            .addOnCanceledListener {
                Log.w(TAG, "publishData: Write canceled")
            }
        val nfcUpdate = updateData.toNfcUpdate()
        nfcUpdateViewModel.setNfcUpdate(nfcUpdate)
    }

    private val hideSystemUiHandler = Handler()

    private fun delayHideUI() {
        // Always hide the system UI after 3 seconds.
        hideSystemUiHandler.removeCallbacksAndMessages(null)
        hideSystemUiHandler.postDelayed({
            hideSystemUI()
        }, HIDE_SYSTEM_UI_DELAY_MS)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        Log.d(TAG, "onWindowFocusChanged")
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    private fun hideSystemUI() {
        Log.d(TAG, "hideSystemUI")
        // Enables regular immersive mode.
        // For "lean back" mode, remove SYSTEM_UI_FLAG_IMMERSIVE.
        // Or for "sticky immersive," replace it with SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE
                // Set the content to appear under the system bars so that the
                // content doesn't resize when the system bars hide and show.
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                // Hide the nav bar and status bar
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN)
    }

    // Shows the system bars by removing all the flags
    // except for the ones that make the content appear under the system bars.
    private fun showSystemUI() {
        Log.d(TAG, "showSystemUI")
        window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                )
    }

    companion object {
        const val TAG = "NfcUrlActivity"
        const val UUID_KEY: String = "com.chriscartland.marauder.UUID_KEY"
        const val HIDE_SYSTEM_UI_DELAY_MS: Long = 3 * 1000 // 3 seconds.
        const val REPEAT_NFC_ATTEMPT_MIN_DELAY_MS: Long = 500 // 5 seconds.
        const val REPEAT_NFC_ATTEMPT_MAX: Int = 5
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

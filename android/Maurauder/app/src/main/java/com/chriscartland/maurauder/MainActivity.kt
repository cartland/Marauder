package com.chriscartland.maurauder

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.AsyncTask
import android.os.Bundle
import android.os.PersistableBundle
import android.text.method.ScrollingMovementMethod
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject
import java.util.ArrayList
import java.util.HashMap
import java.util.UUID


class MainActivity : AppCompatActivity() {

    private var uuid: String? = null
    private lateinit var manager: BluetoothManager
    private var adapter: BluetoothAdapter? = null
    private var bleScanner: BluetoothLeScanner? = null
    private lateinit var startScanButton: Button
    private lateinit var stopScanButton: Button
    private lateinit var mainTextView: TextView

    // Bluetooth device scan callback.
    private val bleScanCallback = object : ScanCallback() {

        /**
         * RSSI data provides a measure of the signal strength.
         *
         * Lower numbers usually suggest that the device is farther away.
         * Higher numbers usually suggest that the device is closer.
         *
         * Returns the received signal strength in dBm. The valid range is [-127, 126].
         * https://developer.android.com/reference/android/bluetooth/le/ScanResult.html#getRssi()
         */
        private val rssiData = HashMap<String, ArrayList<Int>>()
        private val db = FirebaseFirestore.getInstance()

        override fun onScanResult(callbackType: Int, result: ScanResult) {
            if (TILE_BLUETOOTH_DEVICE_NAME != result.device.name) {
                // We only care about Tile devices.
                return
            }
            // Extract device information.
            val device = result.device
            val name = device.name
            val friendlyName = addressToName(device.address)

            // Save RSSI measurement.
            val rssiMeasurements = rssiData[friendlyName] ?: ArrayList()
            rssiMeasurements.add(result.rssi)
            rssiData[friendlyName] = rssiMeasurements

            // Display device and RSSI information.
            val sb = StringBuilder()
            for (key in rssiData.keys) {
                sb.append("$key $name ${rssiData[key]}")
                sb.append("\n")
            }
            mainTextView.text = sb.toString()

            val phoneLocationSpinner = findViewById<Spinner>(R.id.phoneLocationSpinner)
            val tileDeviceSpinner = findViewById<Spinner>(R.id.tileDeviceSpinner)
            val tileLocationSpinner = findViewById<Spinner>(R.id.tileLocationSpinner)

            val update = hashMapOf(
                "appVersionCode" to BuildConfig.VERSION_CODE,
                "appVersionName" to BuildConfig.VERSION_NAME,
                "phoneUUID" to uuid,
                "bleDevice" to device,
                "bleName" to name,
                "bleFriendlyName" to friendlyName,
                "bleRssiMeasurement" to result.rssi,
                "timestamp" to FieldValue.serverTimestamp(),
                "phoneLocation" to phoneLocationSpinner.selectedItem.toString()
            )

            val selectedTileLocation = tileDeviceSpinner.selectedItem.toString()
            if (selectedTileLocation == friendlyName) {
                Log.d(TAG, "Uploading tile")
                val tileLocation = tileLocationSpinner.selectedItem.toString()
                update["tileLocation"] = tileLocation
                db.collection("updatesv2").document().set(update)
            }
            Log.d(TAG, JSONObject(update).toString())

            // Scroll the text to the bottom of the view.
            val lineTop = mainTextView.layout?.getLineTop(mainTextView.lineCount) ?: 0
            val height = mainTextView.height
            val scrollAmount = lineTop - height
            if (scrollAmount > 0) {
                mainTextView.scrollTo(0, scrollAmount)
            }
        }
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle?) {
        Log.d(TAG, "onRestoreInstanceState")
        uuid = savedInstanceState?.getString(Companion.UUID_KEY)
    }

    override fun onSaveInstanceState(outState: Bundle?, outPersistentState: PersistableBundle?) {
        Log.d(TAG, "onSaveInstanceState")
        outState?.run {
            putString(Companion.UUID_KEY, uuid)
        }
        super.onSaveInstanceState(outState, outPersistentState)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (uuid == null) {
            Log.d(TAG, "onRestoreInstanceState: randomUUID()")
            uuid = UUID.randomUUID().toString()
        }

        setContentView(R.layout.activity_main)

        mainTextView = findViewById(R.id.main_text_view)
        mainTextView.movementMethod = ScrollingMovementMethod()

        startScanButton = findViewById(R.id.start_scan_button)
        startScanButton.setOnClickListener { startScanning() }
        stopScanButton = findViewById(R.id.stop_scan_button)
        stopScanButton.setOnClickListener { stopScanning() }

        manager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        adapter = manager.adapter
        bleScanner = adapter?.bluetoothLeScanner

        // Bluetooth is disabled. Ask user to turn on Bluetooth.
        val finalAdapter = adapter
        if (finalAdapter != null && !finalAdapter.isEnabled) {
            val enableIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            startActivityForResult(enableIntent, REQUEST_ENABLE_BT)
        }

        // Request to allow permissions.
        if (this.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            val builder = AlertDialog.Builder(this)
            builder.setTitle(getString(R.string.permission_title))
            builder.setMessage(getString(R.string.permission_message))
            builder.setPositiveButton(android.R.string.ok, null)
            builder.setOnDismissListener {
                requestPermissions(
                    arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION),
                    PERMISSION_REQUEST_COARSE_LOCATION
                )
            }
            builder.show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        when (requestCode) {
            PERMISSION_REQUEST_COARSE_LOCATION -> {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Log.d(TAG, "onRequestPermissionsResult: Coarse location permission granted")
                    if (bleScanner == null) {
                        Log.d(TAG, "onRequestPermissionsResult: Retrieving BluetoothLeScanner")
                        bleScanner = adapter?.bluetoothLeScanner
                    }
                } else {
                    val builder = AlertDialog.Builder(this)
                    builder.setTitle(getString(R.string.permission_denied_title))
                    builder.setMessage(getString(R.string.permission_denied_message))
                    builder.setPositiveButton(android.R.string.ok, null)
                    builder.show()
                }
                return
            }
        }
    }

    private fun startScanning() {
        Log.d(TAG, "startScanning")
        mainTextView.text = ""
        startScanButton.visibility = View.INVISIBLE
        stopScanButton.visibility = View.VISIBLE
        AsyncTask.execute {
            bleScanner?.startScan(bleScanCallback)
            if (bleScanner == null) {
                Log.w(TAG, "startScanning: BluetoothLeScanner not available")
            }
        }
    }

    private fun stopScanning() {
        Log.d(TAG, "stopScanning")
        mainTextView.append("Stopped Scanning")
        startScanButton.visibility = View.VISIBLE
        stopScanButton.visibility = View.INVISIBLE
        AsyncTask.execute {
            bleScanner?.stopScan(bleScanCallback)
            if (bleScanner == null) {
                Log.w(TAG, "stopScanning: BluetoothLeScanner not available")
            }
        }
    }

    /**
     * Known Bluetooth addresses.
     */
    private fun addressToName(address: String) = when (address) {
        "DD:AE:AB:74:C0:D6" -> "Car Keys"
        "F5:35:C6:2E:3A:0D" -> "Backpack"
        "EF:82:C5:3A:35:78" -> "Suitcase"
        "DA:57:85:50:C1:0C" -> "Camera"
        else -> address
    }

    companion object {
        private val TAG = MainActivity::class.java.simpleName
        private const val REQUEST_ENABLE_BT = 1
        private const val PERMISSION_REQUEST_COARSE_LOCATION = 1
        private const val TILE_BLUETOOTH_DEVICE_NAME = "Tile"
        private const val UUID_KEY: String = "UUID_KEY"
    }
}

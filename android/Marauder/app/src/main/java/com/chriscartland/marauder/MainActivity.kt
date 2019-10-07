package com.chriscartland.marauder

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Resources
import android.os.AsyncTask
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PersistableBundle
import android.text.method.ScrollingMovementMethod
import android.util.Log
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
    private lateinit var clearButton: Button
    private lateinit var devicesOfInterestList: TextView
    private lateinit var mainTextView: TextView
    private val devicesOfInterest: MutableMap<String, String> = HashMap()

    /**
     * RSSI data provides a measure of the signal strength.
     *
     * Lower numbers usually suggest that the device is farther away.
     * Higher numbers usually suggest that the device is closer.
     *
     * Returns the received signal strength in dBm. The valid range is [-127, 126].
     * https://developer.android.com/reference/android/bluetooth/le/ScanResult.html#getRssi()
     */
    val rssiData = HashMap<String, ArrayList<Int>>()

    // Bluetooth device scan callback.
    private val bleScanCallback = object : ScanCallback() {

        private val db = FirebaseFirestore.getInstance()

        override fun onScanResult(callbackType: Int, result: ScanResult) {
            Log.d(TAG, "onScanResult")
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
            val tileLocationSpinner = findViewById<Spinner>(R.id.tileLocationSpinner)

            val update = hashMapOf(
                "appVersionCode" to BuildConfig.VERSION_CODE,
                "appVersionName" to BuildConfig.VERSION_NAME,
                "phoneModel" to android.os.Build.MODEL,
                "phoneUUID" to uuid,
                "bleDevice" to device,
                "bleName" to name,
                "bleFriendlyName" to friendlyName,
                "bleRssiMeasurement" to result.rssi,
                "timestamp" to FieldValue.serverTimestamp(),
                "phoneLocation" to phoneLocationSpinner.selectedItem.toString()
            )

            if (devicesOfInterest.values.contains(friendlyName)) {
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
        val out = outState ?: Bundle()
        val persistableOut = outPersistentState ?: PersistableBundle()
        out.run {
            putString(Companion.UUID_KEY, uuid)
        }
        super.onSaveInstanceState(out, persistableOut)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (uuid == null) {
            Log.d(TAG, "onRestoreInstanceState: randomUUID()")
            uuid = UUID.randomUUID().toString()
        }

        loadDevicesOfInterest(resources, devicesOfInterest)

        setContentView(R.layout.activity_main)

        mainTextView = findViewById(R.id.main_text_view)
        mainTextView.movementMethod = ScrollingMovementMethod()

        startScanButton = findViewById(R.id.start_scan_button)
        startScanButton.setOnClickListener {
            restartPeriodically()
        }
        stopScanButton = findViewById(R.id.stop_scan_button)
        stopScanButton.setOnClickListener {
            restartScanHandler.removeCallbacksAndMessages(null)
            restartOnStop = false
            stopScanning()
        }
        clearButton = findViewById(R.id.clear_button)
        clearButton.setOnClickListener {
            mainTextView.text = ""
            clearRssiData()
        }

        devicesOfInterestList = findViewById(R.id.listOfKnownBleDevices)
        devicesOfInterestList.text = devicesOfInterest.toString()

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
        } else {
            restartPeriodically()
        }
    }

    private fun loadDevicesOfInterest(resources: Resources, devicesOfInterest: MutableMap<String, String>) {
        resources.getStringArray(R.array.devices_of_interest).let { listOfDeviceInfos ->
            for (value in listOfDeviceInfos) {
                val keyValue = value.split("->")
                val key = keyValue[0] as String
                val value = keyValue[1] as String
                devicesOfInterest[key] = value
            }
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
                    restartPeriodically()
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

    private fun clearRssiData() {
        rssiData.clear()
    }

    private fun startScanning() {
        Log.d(TAG, "startScanning")
        AsyncTask.execute {
            bleScanner?.startScan(bleScanCallback)
            if (bleScanner == null) {
                Log.w(TAG, "startScanning: BluetoothLeScanner not available")
            }
            onScanStarted()
        }
    }

    private fun onScanStarted() {
        Log.w(TAG, "onScanStarted")
    }

    private fun stopScanning() {
        Log.d(TAG, "stopScanning")
        AsyncTask.execute {
            bleScanner?.stopScan(bleScanCallback)
            if (bleScanner == null) {
                Log.w(TAG, "stopScanning: BluetoothLeScanner not available")
            }
            onScanStopped()
        }
    }

    private var restartOnStop: Boolean = false

    private fun onScanStopped() {
        Log.w(TAG, "onScanStopped")
        if (restartOnStop) {
            restartOnStop = false
            startScanning()
        }
    }

    private fun restartScanning() {
        Log.d(TAG, "restartScanning")
        stopScanning()
        restartOnStop = true
    }

    // TODO: Handle screen rotations (onDestroy, etc).
    val restartScanHandler = Handler(Looper.getMainLooper())

    private fun restartPeriodically(delayMillis : Long = 1L * 60L * 1000L /* 1 minute */) {
        Log.d(TAG, "restartPeriodically: delayMillis $delayMillis")
        restartScanning()
        restartScanHandler.postDelayed(object : Runnable {
            override fun run() {
                restartScanning()
                restartScanHandler.postDelayed(this, delayMillis)
            }
        }, delayMillis)
    }

    /**
     * Known Bluetooth addresses.
     */
    private fun addressToName(address: String): String =
        if (devicesOfInterest.containsKey(address)) {
            devicesOfInterest[address] ?: address
        } else {
            address
        }

    companion object {
        private val TAG = MainActivity::class.java.simpleName
        private const val REQUEST_ENABLE_BT = 1
        private const val PERMISSION_REQUEST_COARSE_LOCATION = 1
        private const val TILE_BLUETOOTH_DEVICE_NAME = "Tile"
        private const val UUID_KEY: String = "UUID_KEY"
    }
}

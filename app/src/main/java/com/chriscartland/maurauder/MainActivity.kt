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
import android.text.method.ScrollingMovementMethod
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var manager: BluetoothManager
    private lateinit var adapter: BluetoothAdapter
    private lateinit var bleScanner: BluetoothLeScanner
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

            // Scroll the text to the bottom of the view.
            val lineTop = mainTextView.layout?.getLineTop(mainTextView.lineCount) ?: 0
            val height = mainTextView.height
            val scrollAmount = lineTop - height
            if (scrollAmount > 0) {
                mainTextView.scrollTo(0, scrollAmount)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        mainTextView = findViewById(R.id.main_text_view)
        mainTextView.movementMethod = ScrollingMovementMethod()

        startScanButton = findViewById(R.id.start_scan_button)
        startScanButton.setOnClickListener { startScanning() }
        stopScanButton = findViewById(R.id.stop_scan_button)
        stopScanButton.setOnClickListener { stopScanning() }

        manager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        adapter = manager.adapter
        bleScanner = adapter.bluetoothLeScanner

        // Bluetooth is disabled. Ask user to turn on Bluetooth.
        if (!adapter.isEnabled) {
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
                    Log.d(TAG, "Coarse location permission granted")
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
        AsyncTask.execute { bleScanner.startScan(bleScanCallback) }
    }

    private fun stopScanning() {
        Log.d(TAG, "stopScanning")
        mainTextView.append("Stopped Scanning")
        startScanButton.visibility = View.VISIBLE
        stopScanButton.visibility = View.INVISIBLE
        AsyncTask.execute { bleScanner.stopScan(bleScanCallback) }
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
    }
}

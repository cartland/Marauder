# Marauder's Map Android App

  * NFC reader publishes wand information to a Firestore Database
  * The app also contains a webview so that Android devices display the HTML5 website
  * The app can be used to display the map on Android TV, Android phones, and Android tablets
  * The app will keep the device awake as long as the app is in the foreground
  * The NFC reader mode is very dark so that the screen will not consume as much electricity
  * When the "reset" wand is used, all of the Android webviews are reloaded. This helps during development, because you can deploy a new website and ensure that all of the Anrdoid devices receive the updated web app in a few seconds, without needing to touch any Android devices.

## NFC data read by the app

The NFC tags must have data in one of the following formats:

* `https://marauder-129.web.app/?logicalid=test123`
* `marauder://marauder-129.web.app/?logicalid=test123`

## Android data sent to the server

Example data sent to the server:

    {
        "nfcData": {
            "nfcLogicalId": "test123",
            "nfcReaderLocation": "hallway",
            "nfcUri": "https://marauder-129.web.app/?logicalid=test123"
        },
        "timestamp": null,
        "zApp": {
            "zAppVersionCode": 14,
            "zAppVersionName": "2.0.0"
        },
        "zPhone": {
            "zPhoneModel": "Nexus 5X",
            "zPhoneUUID": "5206cfee-6e15-4f25-a3f5-d0ced4cd58d6"
        }
    }

## Changing the location configuration of the phone

The Android app will open the NFC reader mode and report the `nfcLogicalId` to the server. The `nfcReaderLocation` is configured on the Android device.

To change the location configuration of the NFC reader, you need to take 3 steps:
1. Change the dropdown selector
1. Tap "Set NFC Reader Location"
1. Confirm the location change by tapping "Ok"
1. If an NFC tag is detected before tapping "Ok", you must start from the beginning

We ask for many confirmation steps in order to avoid accidentally changing the room while the phone is face-down on a table. In our testing, we placed the phone upside down on a table, which accidentally pressed buttons.

## Testing with `adb` on Android
You can use `adb` to simulate launching an NFC URL. Here is an example:

    adb -d shell 'am start -a android.intent.action.VIEW -d https://marauder-129.web.app/\?logicalid\=test123'

The app also supports the custom URI scheme `marauder://`.

    adb -d shell 'am start -a android.intent.action.VIEW -d marauder://marauder-129.web.app/\?logicalid\=test123'

## Testing with NFC tag

* Get an NFC Tag
  * We used a $3 NFC tag from Adafruit: *Micro NFC/RFID Transponder - NTAG203 13.56MHz* [https://www.adafruit.com/product/2800](https://www.adafruit.com/product/2800)
* Configure NFC Tag
  * Download the [NFC Tools Android app from Google Play](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc&hl=en_US):
  * Select the "Write" tab
  * Select "Add a record"
  * Select "Custom URL / URI"
  * Type or paste `https://marauder-129.web.app/?logicalid=test123`
    * Replace `test123` with a unique identifier for the NFC tag
    * Replace `https://` with `marauder://` if you want to use the custom scheme
* Tap the NFC tag to the NFC sensor on the phone


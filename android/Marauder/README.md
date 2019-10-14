# Marauder's Map
Tools to support the Marauder's Map.

## Magic Wand NFC Tags
Tap a wand (NFC tag) to a phone running the Marauder's Map Android app.

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

### Testing without an NFC tag
You can use `adb` to simulate launching an NFC URL. Here is an example:

    adb -d shell 'am start -a android.intent.action.VIEW -d https://marauder-129.web.app/\?logicalid\=test123'

The app also supports the custom URI scheme `marauder://`.

    adb -d shell 'am start -a android.intent.action.VIEW -d marauder://marauder-129.web.app/\?logicalid\=test123'

### Testing with NFC tag

1. Get an NFC Tag: https://www.adafruit.com/product/2800
1. Configure NFC Tag
  * Download the [NFC Tools Android app from Google Play](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc&hl=en_US):
  * Select the "Write" tab
  * Select "Add a record"
  * Select "Custom URL / URI"
  * Type or past `https://marauder-129.web.app/?logicalid=test123`
    * Replace `test123` with a unique identifier for the NFC tag
    * Replace `https://` with `marauder://` if you want to use the custom scheme
1. Tap the NFC tag to the NFC sensor on the phone


var admin = require("firebase-admin");

var serviceAccount = require("./marauder-129-firebase-adminsdk-1aa9h-a04054c286.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://marauder-129.firebaseio.com"
});

let db = admin.firestore();

let updatesRef = db.collection('updatesv2');

let recent = updatesRef
  .orderBy("timestamp", "desc")
  .get()
  .then(snapshot => {
    var firstPhoneUUID;
    const phoneUUIDs = new Set();
    snapshot.forEach(doc => {
      phoneUUID = doc.data().phoneUUID;
      if (firstPhoneUUID == null) {
        firstPhoneUUID = phoneUUID;
      }
      phoneUUIDs.add(phoneUUID);
    });
    console.log('Unique UUIDs');
    console.log(Array.from(phoneUUIDs).join(', '));
    getAllForPhoneUUID(firstPhoneUUID);
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });

function getAllForPhoneUUID(phoneUUID) {
  let phoneUpdates = updatesRef.where('phoneUUID', '==', phoneUUID).get()
  .then(snapshot => {
    const output = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      output.push({
        "phoneUUID": data.phoneUUID,
        "phoneLocation": data.phoneLocation,
        "rssiMeasurement": data.bleRssiMeasurement,
        "tileLocation": data.tileLocation,
        "timestamp": new Date(data.timestamp.toMillis()).toISOString()
      });
    });
    console.log(output);
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });
}


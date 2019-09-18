var admin = require("firebase-admin");

var serviceAccount = require("./marauder-129-firebase-adminsdk-1aa9h-a04054c286.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://marauder-129.firebaseio.com"
});

let db = admin.firestore();
let updatesRef = db.collection('updatesv2');

main();

function main() {
  // Get the most recent UUID.
  // Use the UUID to get the data for the UUID.
  // Display the data for the UUID.
  // Get the unique UUIDs.
  // Then display the recent UUID.
  // Then display the unique UUIDs.
  getRecentUUID(updatesRef)
    .then(function (phoneUUID) {
      return getDataForUUID(updatesRef, phoneUUID)
        .then(function (data) {
          return new Promise(function (resolve, reject) {
            console.log(data);
            resolve();
          });
        })
        .then(function() {
          return getUniqueUUIDs();
        })
        .then(function(uniqueUUIDs) {
          return new Promise(function (resolve, reject) {
            console.log('Recent UUID:', phoneUUID);
            console.log('Unique UUIDs:', Array.from(uniqueUUIDs).join(', '));
            resolve();
          });
        });
    });
}


function getRecentUUID(updatesRef) {
  return updatesRef.orderBy("timestamp", "desc").limit(1).get()
    .then(function (snapshot) {
      return new Promise(function (resolve, reject) {
        snapshot.forEach(doc => {
          phoneUUID = doc.data().phoneUUID;
          resolve(phoneUUID);
        });
      });
    });
}

function getUniqueUUIDs() {
  return updatesRef.orderBy("timestamp", "desc").get()
    .then(function (snapshot) {
      return new Promise(function (resolve, reject) {
        const phoneUUIDs = new Set();
        snapshot.forEach(doc => {
          phoneUUID = doc.data().phoneUUID;
          phoneUUIDs.add(phoneUUID);
        });
        resolve(phoneUUIDs);
      });
    });
}

function getDataForUUID(updatesRef, phoneUUID) {
  return updatesRef.where('phoneUUID', '==', phoneUUID).limit(10).get()
    .then(snapshot => {
      return new Promise(function (resolve, reject) {
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
        resolve(output);
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}


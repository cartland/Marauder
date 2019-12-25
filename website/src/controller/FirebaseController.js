import { C } from "../config/C";
import { Random } from '../util/Random';

export class FirebaseController {
  constructor(firebase, personController, roomController, pathController) {
    this.firebase = firebase;
    this.personController = personController;
    this.roomController = roomController;
    this.pathController = pathController;
  }

  initialize = () => {
    this.firebase.firestore().collection('nfcUpdates')
      .where('timestamp', '>', new Date())
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let roomKey = change.doc.get('nfcData').nfcReaderLocation;
            let personKey = change.doc.get('nfcData').nfcLogicalId;
            let timestamp = change.doc.get('timestamp');
            const milliseconds = timestamp.seconds * 1000;

            // Check to see if this is a reset request.
            if (personKey === C.RESET_LOGICAL_ID) {
              window.location.reload();
              return;
            }
            this.pathController.wandTapped(
              this.roomController.getRoom(roomKey),
              this.personController.getPerson(personKey),
              milliseconds);
          }
        });
      });

    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    let that = this;
    this.firebase.firestore().collection('nfcUpdates')
      .where('timestamp', '>', yesterday)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let personKey = change.doc.get('nfcData').nfcLogicalId;
            let timestamp = change.doc.get('timestamp');
            const milliseconds = timestamp.seconds * 1000;
            // // Check to see if this is a reset request.
            if (personKey === C.RESET_LOGICAL_ID) {
              if (milliseconds > that.resetTimestamp) {
                console.log('Initialize with seed.', milliseconds);
                that.resetTimestamp = milliseconds;
                console.log('Initializing start time', milliseconds);
                let seed = that.resetTimestamp;
                that.pathController.initializeAllPaths(this.personController.getPeople(), milliseconds, seed);
              } else {
                console.log('Ignoring old reset.', milliseconds);
              }
              return;
            }
          }
        });
      });
  }
}

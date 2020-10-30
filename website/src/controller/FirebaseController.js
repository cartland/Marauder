/**
 * Copyright 2019 Chris Cartland and Andrew Stromme. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

            // Check to see if this is a reset request.
            if (personKey === C.RESET_LOGICAL_ID) {
              window.location.reload();
              return;
            }
            this.pathController.wandTapped(
              this.roomController.getRoom(roomKey),
              this.personController.getPerson(personKey),
              timestamp);
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

            // // Check to see if this is a reset request.
            if (personKey === C.RESET_LOGICAL_ID) {
              let seconds = timestamp.seconds;
              if (seconds > that.resetTimestamp) {
                console.log('Initialize with seed.', seconds);
                that.resetTimestamp = seconds;
                let milliseconds = this.resetTimestamp * 1000;
                let dateFromTimestamp = new Date(milliseconds);
                console.log('Initializing start time', dateFromTimestamp);
                let prng = new Random(that.resetTimestamp);
                that.pathController.initializeAllPaths(this.personController.getPeople(), dateFromTimestamp, prng);
              } else {
                console.log('Ignoring old reset.', seconds);
              }
              return;
            }
          }
        });
      });
  }
}

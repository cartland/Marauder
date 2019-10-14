import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import * as firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAB6ZFmbWGpShtUzKSj_a6tguW4oS861os",
  authDomain: "marauder-129.firebaseapp.com",
  databaseURL: "https://marauder-129.firebaseio.com",
  projectId: "marauder-129",
  storageBucket: "marauder-129.appspot.com",
  messagingSenderId: "565983619801",
  appId: "1:565983619801:web:08aa6ae259bd8682e4ecc8"
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

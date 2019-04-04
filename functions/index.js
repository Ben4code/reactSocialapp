//initialize CLoud functions
const functions = require('firebase-functions');

//initialize Cloud firestore
const firebase = require('firebase');
const config = require('./util/config');
firebase.initializeApp(config);

//Import Scream Handlers
const { getAllScreams, postOneScreams } = require('./handlers/screams');
const { signup, login} = require('./handlers/users');

//Import FBAuth
const FBAuth = require('./util/FBAuth');

//Initialize Express
const express = require('express');
const app = express();

//Scream Routes
app.get('/screams', getAllScreams);
app.post('/screams', FBAuth, postOneScreams);

//User Routes
app.post('/signup', signup)
app.post('/login', login);

exports.api = functions.https.onRequest(app);
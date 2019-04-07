//initialize CLoud functions
const functions = require('firebase-functions');

//initialize Cloud firestore
const firebase = require('firebase');
const config = require('./util/config');
firebase.initializeApp(config);

//Import Scream Handlers
const { getAllScreams, postOneScreams, getScream, screamComment } = require('./handlers/screams');
const { signup, login, addUserDetails, getAuthUser, uploadImage} = require('./handlers/users');

//Import FBAuth
const FBAuth = require('./util/FBAuth');

//Initialize Express
const express = require('express');
const app = express();

//Scream Routes
app.get('/screams', getAllScreams);
app.post('/screams', FBAuth, postOneScreams);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, screamComment)

//User Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/users', FBAuth, addUserDetails);
app.get('/users', FBAuth, getAuthUser);
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
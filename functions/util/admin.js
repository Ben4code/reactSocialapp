const admin = require('firebase-admin');
const firebase = require('firebase');

admin.initializeApp();

const db = firebase.firestore();

module.exports = { admin, db}; 
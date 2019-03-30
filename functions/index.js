//initialize CLoud functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//initialize Cloud firestore
    //const admin = require('firebase-admin');
    //const functions = require('firebase-functions');
    // admin.initializeApp(functions.config().firebase);
    // const db = admin.firestore();


//initialize Cloud firestore
const firebase = require('firebase');
const config = {
    apiKey: "AIzaSyArWGXKK40z9Ralgsqo4vqklYTCX08QW-o",
    authDomain: "reactsocial-5e291.firebaseapp.com",
    databaseURL: "https://reactsocial-5e291.firebaseio.com",
    projectId: "reactsocial-5e291",
    storageBucket: "reactsocial-5e291.appspot.com",
    messagingSenderId: "297521307129"
};

//initialize firestore
firebase.initializeApp(config);
const db = admin.firestore();


//Express Imports
const express = require('express');
const app = express();


app.get('/screams', (req, res) => {
    db.collection('screams').get().then(data => {
        let screams = [];
        data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        })
        return res.json(screams);
    })
        .catch(error => {
            console.log(error);
        })
})

app.post('/screams', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };
    db.collection('screams').add(newScream)
        .then(data => {
            res.json({ msg: `document ${data.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ err: 'Something went wrong' })
            console.log(err);
        })
})


app.post('/signup', (req, res)=>{
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    
    //Validate data
    db.collection('users').doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle: "This handle already exists."})
        }else{
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.status(201).json({token})
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code})
    })
})


exports.api = functions.https.onRequest(app);
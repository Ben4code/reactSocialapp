//initialize CLoud functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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
firebase.initializeApp(config);
const db = firebase.firestore();

//Initialize Express
const express = require('express');
const app = express();

//App Routes
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
    let token;
    let userId;

    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    
    //Validate data
    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({handle: "This handle already exists."})
        }else{
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then(data => {
        userId = data.user.uid;
        const userCredendials = {
            email: newUser.email,
            handle: newUser.handle,
            createdAt: new Date().toISOString(),
            userId: userId
        }
        db.doc(`/users/${newUser.handle}`).set(userCredendials)
        return data.user.getIdToken();
    })
    .then(token => {
        token = token;
        return res.status(201).json({token})
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({email: 'Email is already in use'})
        } else{
            return res.status(500).json({ error: err.code})
        }
        
    })
})


exports.api = functions.https.onRequest(app);
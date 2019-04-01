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
});

const isEmpty = (field) =>{
    if(field.trim() === '') return true;
    else return false;
}

const isEmail = (field) =>{
    const emailRegEx = 
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(field.match(emailRegEx)) return true;
    else return false;
}

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
    let errors = {};

    //Email
    if(isEmpty(newUser.email)){
        errors.email = "Email field can not be empty";
    }else if(!isEmail(newUser.email)){
        errors.email = "Please enter a valid email";
    }

    //Password
    if(isEmpty(newUser.password)) errors.password = "Password field can not be empty";
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Password fields must match";
    
    //Handle
    if(isEmpty(newUser.handle)) errors.handle = "Handle field can not be empty";
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);
    

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

app.post('/login', (req, res) =>{
    newUser = {
        email: req.body.email,
        password: req.body.password
    }

    //Validation
    let errors = {};
    if(isEmpty(newUser.email)) errors.email = "Email field is required.";
    if(isEmpty(newUser.password)) errors.password = "Password field is required.";
    if(Object.keys(errors).length > 0 ) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token =>{
        res.json(token)
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/wrong-password'){
            return res.status(403).json({authFail: "Email or password is incorrect, try again."});    
        }else{
            return res.status(500).json({error: err.code});
        }
    })
})
exports.api = functions.https.onRequest(app);
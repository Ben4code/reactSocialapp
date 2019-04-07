//initialize Cloud firestore
const firebase = require('firebase');
const {admin, db} = require('../util/admin');
const { validateSignUpData, validateLoginData, reduceUserDetails } = require('../util/validators');
const config = require('../util/config');

//Signup
exports.signup = (req, res)=>{
    let token;
    let userId;

    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    
    //Validation
    const { valid, errors } = validateSignUpData(newUser);
    if(!valid) return res.status(400).json(errors);
    
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
        const noImg = 'no-img.png';

        const userCredendials = {
            email: newUser.email,
            handle: newUser.handle,
            createdAt: new Date().toISOString(),
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`, 
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
}

//Login
exports.login = (req, res) =>{
    newUser = {
        email: req.body.email,
        password: req.body.password
    }

    //Validation
    const {errors, valid} = validateLoginData(newUser);
    if(!valid) return res.status(400).json(errors);

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
};


//Add userdata
exports.addUserDetails = (req, res)=> {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(()=>{
        return res.json({message: 'Details added successfully'});
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: err.code});
    })
}

//get user credentials
exports.getAuthUser = (req, res) =>{
    let userData = {};
    db.doc(`/users/${req.user.handle}`).get()
    .then(doc => {
        if(doc.exists){
           userData.credentials = doc.data();
           return db.collection('likes').where('userHandle', '==', req.user.handle).get()
        }
    })
    .then(data => {
        userData.likes = [];
        data.forEach(doc => {
           userData.likes.push(doc.data()) 
        })
        return res.json(userData);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: err.code});
    })
}

//Upload profile pic
exports.uploadImage = (req, res) => {
    const path = require('path');
    const Busboy = require('busboy');
    const fs = require('fs');
    const os = require('os');

    const busBoy = new Busboy({headers: req.headers});
    
    let imageFileName;
    let imageToBeUploded = {};

    busBoy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        //console.log("fieldname:" , fieldname, "filename:",filename, "imetype:",mimetype);

        const imageExt = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.floor(Math.random() * 1000000)}.${imageExt}`;
        const filePath = path.join(os.tmpdir(), imageFileName);

        //Object to hold path and memtype.
        imageToBeUploded = {filePath, mimetype}

        //Write file to location.
        file.pipe(fs.createWriteStream(filePath));
    });
    busBoy.on('finish', ()=>{
        //Upload the file that was created to firebase
        admin.storage().bucket().upload(imageToBeUploded.filePath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploded.mimetype
                }
            }
        })
        .then(() =>{
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            console.log("Got here");
            return db.doc(`/users/${req.user.handle}`).update({imageUrl});
        })
        .then(()=>{
            return res.json({message: "Image uploaded successfully"});
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: error.code});
        })
    });
    busBoy.end(req.rawBody);
}
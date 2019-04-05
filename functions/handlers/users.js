//initialize Cloud firestore
const firebase = require('firebase');
const {db} = require('../util/admin');
const { validateSignUpData, validateLoginData } = require('../util/validators');


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
}

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
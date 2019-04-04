const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
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
            res.status(500).json({error: error.code});
        })
}

exports.postOneScreams = (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };
    db.collection('screams').add(newScream)
        .then(data => {
            res.json({ msg: `document ${data.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ err: 'Something went wrong' })
            console.log(err);
        })
}

exports.postOneScreams = (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };
    db.collection('screams').add(newScream)
        .then(data => {
            res.json({ msg: `document ${data.id} created successfully` })
        })
        .catch(err => {
            res.status(500).json({ err: 'Something went wrong' })
            console.log(err);
        })
}
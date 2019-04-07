const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
    db.collection('screams').get()
    .then(data => {
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

exports.getScream = (req, res) => {
    let screamData = {};
    db.doc(`/screams/${req.params.screamId}`).get()   
    .then(doc => {
        //Always remember to check if it exists.
        if(!doc.exists){
            return res.status(404).json({error: "Scream not found"});
        }
        screamData.screamId = doc.id;
        screamData = doc.data();
        //Fetch Comments
        return db.collection('comments').orderBy('createdAt', 'desc').where('screamId',  '==', req.params.screamId).get();
    })
    .then((data) => {
        screamData.comments = [];

        data.forEach((doc) => {
            screamData.comments.push(doc.data());
        });

        return res.json(screamData);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code})
    });
}

//Comment on scream
exports.screamComment = (req, res) => {
    if(req.body.body.trim() === '') return res.status(400).json({error: "Comment field must not be empty"});

    const newComment  = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    }

    //Check if scream exists
    db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: "Scream not found"})
        }
        return db.collection('comments').add(newComment);
    })
    .then(() => {
        res.json(newComment)
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code})
    });
}
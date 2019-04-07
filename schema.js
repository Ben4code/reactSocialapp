let db = {
    users: [
        {
            userId: 'sdsdsdnskdjskdjs',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2019-03-13',
            imageUrl: 'image/sdsd/sdsd',
            bio: 'Hello world',
            website: 'https://user.com',
            location: 'London UK'
        }
    ],
    screams: [
        {
            userHandle: 'user',
            body: 'Scream body',
            createdAt: '2019-03-13',
            likeCount: 4,
            commentCount: 23
        }
    ],
    userDetails: {
        //Redux Data
        credentials:{
            userId: 'sdsdsdnskdjskdjs',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2019-03-13',
            imageUrl: 'image/sdsd/sdsd',
            bio: 'Hello world',
            website: 'https://user.com',
            location: 'London UK'
        },
        likes: [
            {
                userHandle: 'user',
                screamId: 'ssdsdmdssksdsd'
            },
            {
                userHandle: 'user2',
                screamId: 'ssdsdmdssksasasasdsd'
            }
        ]
    }
}
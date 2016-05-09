var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var bCrypt = require('bcrypt-nodejs');

var url = 'mongodb://localhost/meanDB';

var insertDocument = function(data, db, callback) {
    db.collection('users').insertOne({


        username: data["username"], //username from api
        password: createHash("user"), //hash created from password
        email: data["email"],

        user_type: data['type'], //artist/ venue/ none
        genre: data['genre'],
        name: data['name'],
        user_location: data['location'],
        user_description: data["description"],
        soundcloud: "www.soundcloud.com",


    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the restaurants collection.");
        callback();
    });
};


var info = [{
        'username': "hongjun",
        'email': "hongjun@brown.edu",
        'genre': "rock and roll",
        'name': "hongjun Choi",
        'type': "artist",
        'location': "providence, RI",
        "description": "I want to perform!"
    },

    {
        'username': "Sean",
        'email': "Sean@brown.edu",
        'genre': "classic",
        'type': "artist",
        'name': "sean",
        'location': "providence, RI",
        "description": "In need of music"
    },

    {
        'username': "Eugene",
        'email': "eguenes@brown.edu",
        'genre': "rock and roll",
        'type': "artist",
        'name': "hongjun Choi",
        'location': "providence, RI",
        "description": "I want to perform!"
    },

    {
        'username': "Betty",
        'email': "Betty@brown.edu",
        'genre': "pop music",
        'type': "venue",
        'name': "Betty",
        'location': "Texas",
        "description": "Musicians are welcome to contact me!"
    },

    {
        'username': "Mike",
        'email': "Mike@brown.edu",
        'genre': "any type",
        'type': "venue",
        'name': "Mike",
        'location': "NY",
        "description": "Great restaurant in NY! "
    },
];

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    for (var i = 0; i < info.length; i++) {
        insertDocument(info[i], db, function() {
            console.log("inserted");
        });
    }

});


// Generates hash using bCrypt
var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

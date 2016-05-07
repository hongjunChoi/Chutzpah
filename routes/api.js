var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Event = mongoose.model('Event');
var Chat = mongoose.model('Chat');

//fileupload
var multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path'),
    maxSize = 10 * 1000 * 1000;


var upload_file = multer({
    dest: './public/uploads/',
    limits: {
        fileSize: maxSize
    }
}).single('file');

var upload_img = multer({
    dest: './public/uploads/img/',
    limits: {
        fileSize: maxSize
    }
}).single('file');


//Used for routes that must be authenticated.
function isAuthenticated(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods
    if (req.method === "GET") {
        return next();
    }
    if (req.isAuthenticated()) {
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

//Register the authentication middleware
//router.use('/posts', isAuthenticated);



router.route('/upload_file')
    .post(function(req, res) {
        console.log("-----file upload requested --------");
        upload_file(req, res, function(err) {
            if (err) {
                console.log("Error: ", err);
                return res.end("Error upoading file");
            }

            var post = new Post();
            post.is_file = true;

            post.created_by = req.session.username;
            post.original_name = req.file.originalname;
            post.user_type = req.session.user_type;
            post.url = res.req.file.path;

            post.save(function(err, p) {
                if (err) {
                    return res.send(500, err);
                }
                res.json(p);
            })
        })
    });

router.route('/upload_img')
    .post(function(req, res) {
        console.log("-----img upload requested --------");
        upload_img(req, res, function(err) {
            if (err) {
                console.log("Error: ", err);
                return res.end("Error upoading image");
            }
            User.findById(req.session.user._id, function(err, user) {
                if (err)
                    res.send(err);
                user.img_url = res.req.file.path;

                user.save(function(err, post) {
                    if (err)
                        res.send(err);
                    res.json(post);
                });
            });
        })
    });

//api for getting chat from specific user
router.route('/get_chat_from')
//make comments on post
.get(function(req, res) {
    console.log("--------get chat from -------")
    var sent_to = req.query.sent_to;
    var sent_from = req.query.sent_from;


    Chat.find({

        $or: [{
            sent_to: sent_to,
            sent_from: sent_from
        }, {
            sent_to: sent_from,
            sent_from: sent_to
        }]

    }).sort({
        sent_at: 1
    }).exec(function(err, chats) {

        if (err) {
            return res.send(500, err);
        }
        return res.send(200, chats);
    });

})

//api for getting comments/ putting comments on posts
router.route('/comment')
//make comments on post
.get(function(req, res) {
    console.log("---------api")
    var post_id = req.query.post_id;
    console.log(post_id)
    Comment.find({
        post_id: post_id
    }, function(err, comments) {
        if (err) {
            return res.send(500, err);
        }
        return res.send(200, comments);
    });
})

.post(function(req, res) {
    console.log("------adding comment ");
    var comment = new Comment();
    comment.created_by = req.body.comment.created_by;
    comment.text = req.body.comment.text;
    comment.post_id = req.body.comment.post_id;

    comment.save(function(err, p) {
        if (err) {
            return res.send(500, err);
        }
        console.log("comment saved");
        res.json(p);
    })
});



//API FOR GETTING SEARCH RESULTS 
router.route('/search')
//gets specified post
.get(function(req, res) {
    var search_string = req.query.search_string.trim();
    console.log(search_string);
    var result = {
        artist_posts: [],
        files: [],
        artists: [],
        requests: [],
        events: []
    };

    User.find({
        $or: [{
            created_by: search_string
        }, {
            post_type: search_string
        }, {
            username: search_string
        }, {
            name: search_string
        }]
    }, function(err, users) {
        if (err) {
            return res.send(err);
        }
        var artists = [];
        users.forEach(function(user) {
            if (user.user_type == "artist") {
                artists.push(user)
            }
        })
        result.artists = artists;

        Post.find({
            $or: [{
                created_by: search_string
            }, {
                post_type: search_string
            }, {
                text: search_string
            }, {
                original_name: search_string
            }, ]
        }, function(err, posts) {
            if (err) {
                return res.send(err);
            }
            console.log("------")
            console.log(posts)
            var files = [];
            var artist_posts = [];
            var requests = [];

            posts.forEach(function(p) {
                console.log(p)
                if (p.user_type == "artist") {
                    if (p.is_file) {
                        files.push(p)
                    } else {
                        artist_posts.push(p)
                    }
                } else if (p.is_request) {
                    requests.push(p)
                }
            })
            result.artist_posts = artist_posts;
            result.files = files;
            result.requests = requests;

            Event.find({
                $or: [{
                    artist: search_string
                }, {
                    venue: search_string
                }, {
                    location: search_string
                }, {
                    genre: search_string
                }]
            }, function(err, events) {
                if (err) {
                    return res.send(err);
                }
                result.events = events;
                res.send(result)
            })
        });

    });

});

router.route("/user")
    .get(function(req, res) {
        var username = req.query.username;
        User.find({
            username: username
        }, function(err, user) {
            if (err) {
                console.log("err")
                return res.send(err);
            }
            return res.json(user)
        });
    });

//api for getting info needed for user profile
router.route("/profile")
    .get(function(req, res) {
        var username = req.query.username;
        result = {
            posts: [],
            info: {}
        }
        User.find({
            username: username
        }, function(err, user) {
            if (err) {
                return res.send(err);
            }
            result.info = user;

            Post.find({
                created_by: username
            }, function(err, post) {
                if (err) {
                    return res.send(err);
                }
                result.posts = post;
                res.send(result)
            });
        });
    });


router.route("/gig_requests")

.post(function(req, res) {

})

.get(function(req, res) {

});



router.route("/artists")

.get(function(req, res) {
    User.find({
            user_type: "artist"
        },
        function(err, users) {
            if (err) {
                return res.send(500, err);
            }
            console.log(users)
            return res.send(200, users)
        });
})

router.route("/events")
//create a new event
.post(function(req, res) {
    var e = new Event();
    console.log(" ==== in creaing evtnt ======");
    e.artist = req.body.artist
    e.venue = req.body.venue
    e.time = req.body.time
    e.genre = req.body.genre
    e.location = req.body.location
    console.log(e.time);
    e.num_likes = 0

    e.save(function(err, e) {
        if (err) {
            return res.send(500, err);
        }
        return res.json(e)
    })
})

.get(function(req, res) {
    Event.find(function(err, events) {
        if (err) {
            return res.send(500, err);
        }
        return res.send(200, events);
    });
})

router.route("/posts")
//creates a new post
.post(function(req, res) {
    console.log("------post requested")
    var post = new Post();
    var text = req.body.newPost.text;
    console.log(req.body)

    post.text = text;
    post.created_by = req.body.newPost.created_by;
    post.user_type = req.body.newPost.user_type;
    post.created_at = Date.now();
    post.is_file = false;

    post.save(function(err, post) {
        if (err) {
            return res.send(500, err);
        }
        return res.json(post);
    });
})

//gets all posts
.get(function(req, res) {
    Post.find(function(err, posts) {
        if (err) {
            return res.send(500, err);
        }
        return res.send(200, posts);
    });
});



// // //post-specific commands. likely won't be used
// // router.route('/posts/:id')
// // //gets specified post
// // .get(function(req, res) {
// //     Post.findById(req.params.id, function(err, post) {
// //         if (err)
// //             res.send(err);
// //         res.json(post);
// //     });
// // })

// //updates specified post
// .put(function(req, res) {
//     Post.findById(req.params.id, function(err, post) {
//         if (err)
//             res.send(err);

//         post.created_by = req.body.created_by;
//         post.text = req.body.text;

//         post.save(function(err, post) {
//             if (err)
//                 res.send(err);

//             res.json(post);
//         });
//     });
// })
// //deletes the post
// .delete(function(req, res) {
//     Post.remove({
//         _id: req.params.id
//     }, function(err) {
//         if (err)
//             res.send(err);
//         res.json("deleted :(");

//     });
// });

module.exports = router;
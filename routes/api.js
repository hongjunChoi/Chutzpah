var express = require('express');
var async = require("async");

var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var Event = mongoose.model('Event');
var Chat = mongoose.model('Chat');
var Like = mongoose.model('Like');

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





router.use(function(req, res, next) {

    //allow all get request methods
    if (req.method === "GET") {
        return next();
    }
    if (typeof req.user === 'undefined' || req.session.user == "undefined" || req.user == null || !(req.session.user)) {
        res.redirect('/#login');
    }

    // if the user is not authenticated then redirect him to the login page
    return next();
});



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
            console.log(req.session)
            post.created_by = req.session.username;
            post.original_name = req.file.originalname;
            post.user_type = req.session.user.user_type;
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
                user.img_url = res.req.file.path
                req.session.user.img_url = user.img_url
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
router.route("/search")
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
        console.log(username)
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



router.route("/like")
    //create a new event
    .post(function(req, res) {
        console.log(req.body);
        var post_id = req.body.post_id
        var created_by = req.body.created_by
        Like.find({
            'post_id': post_id,
            'created_by': created_by
        }, function(err, like) {
            if (err) {
                res.send(500, err);
            }

            if (like.length == 0) {
                var new_like = new Like();
                new_like.post_id = post_id;
                new_like.created_by = created_by;
                new_like.save(function(err, result) {
                    Post.findById(post_id,
                        function(err, data) {
                            if (err) {
                                res.send(500, err);
                            }
                            if ((typeof data.num_likes) === "undefined" || data.num_likes == 0) {
                                data.num_likes = 1;
                            } else {
                                data.num_likes = data.num_likes + 1;
                            }

                            data.save(function(err, result) {
                                if (err) {
                                    res.send(500, err);
                                }
                                res.send(200, new_like);
                            });
                        });
                });
            } else {
                res.send(200, "like already exists");
            }
        });
    });


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



        final_posts = [];
        console.log("LENGTH " + posts.length)
        async.each(posts, function(post, callback) {

            var post_id = post['_id'];

            Like.find({ 'post_id': post_id }, function(err, data) {
                if (err) {
                    res.send(500, err);
                }

                console.log("========= posts like ======");
                var new_post = {};
                new_post['post_info'] = post;
                new_post['like_info'] = data;
                // post['like_info'] = data;

                console.log(JSON.stringify(new_post['like_info']));
                console.log("=========================\n\n")
                final_posts.push(new_post);
                callback();
            });

        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('ERROR');
            } else {
                console.log(JSON.stringify(final_posts))
                console.log("=============== END ============")
                res.send(200, final_posts);
            }
        });



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

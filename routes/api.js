var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment')

//fileupload
var multer = require('multer'),
	bodyParser = require('body-parser'),
	path = require('path'),
	maxSize = 10 * 1000 * 1000;


var upload = multer({
	dest: './public/uploads/',
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
router.use('/posts', isAuthenticated);


router.route('/upload_file')
	.post(function(req, res) {
		console.log("-----file upload requested --------");
		upload(req, res, function(err) {
			if (err) {
				console.log("Error: ", err);
				return res.end("Error upoading file");
			}
			console.log(res.req);
			console.log("success!");
			var post = new Post();
			post.is_file = true;
			post.created_by = res.req.user.username;
			post.original_name = res.req.file.originalname;
			post.url = res.req.file.path;

			post.save(function(err, p) {
				if (err) {
					return res.send(500, err);
				}
				res.json(p);
			})
		})
	});

//api for getting comments/ putting comments on posts
router.route('/comment')
//make comments on post
.get(function(req, res) {

	var post_id = req.query.post_id;
	post_id = post_id.toString().trim();

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
		musician: [],
		music: []
	};

	User.find({
		$or: [{
			created_by: search_string
		}, {
			post_type: search_string
		}, {
			username: search_string
		}, {
			band_name: search_string
		}, {
			user_type: search_string
		}]
	}, function(err, user) {
		if (err) {
			return res.send(err);
		}
		result.musician = user;

		Post.find({
			$or: [{
				created_by: search_string
			}, {
				post_type: search_string
			}, {
				text: search_string
			}, {
				original_name: search_string
			}]
		}, function(err, post) {
			if (err) {
				return res.send(err);
			}
			result.music = post;
			console.log(result);
			res.send(result)
		});

	});
});


//api for getting info needed for user profile
router.route("/profile")
	.get(function(req, res) {
		var username = req.query.username;
		console.log("========")
		console.log(req.query)
		console.log(req.body);
		console.log("========")
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



router.route('/posts')
//creates a new post
.post(function(req, res) {
	var post = new Post();
	var text = req.body.text;

	post.text = text;
	post.created_by = req.body.created_by;
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



//post-specific commands. likely won't be used
router.route('/posts/:id')
//gets specified post
.get(function(req, res) {
	Post.findById(req.params.id, function(err, post) {
		if (err)
			res.send(err);
		res.json(post);
	});
})

//updates specified post
.put(function(req, res) {
	Post.findById(req.params.id, function(err, post) {
		if (err)
			res.send(err);

		post.created_by = req.body.created_by;
		post.text = req.body.text;

		post.save(function(err, post) {
			if (err)
				res.send(err);

			res.json(post);
		});
	});
})
//deletes the post
.delete(function(req, res) {
	Post.remove({
		_id: req.params.id
	}, function(err) {
		if (err)
			res.send(err);
		res.json("deleted :(");

	});
});

module.exports = router;
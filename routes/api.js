var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var Post = mongoose.model('Post');
var File = mongoose.model('File');
var User = mongoose.model('User');

//fileupload
var multer = require('multer'),
	bodyParser = require('body-parser'),
	path = require('path');
	maxSize = 1 * 1000 * 1000;

var upload = multer({ dest: './uploads/', limits: {fileSize: maxSize } }).single('file');
//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};

//Register the authentication middleware
router.use('/posts', isAuthenticated);


router.route('/posts')
	//creates a new post
	.post(function(req, res){
		var post = new Post();
		var url = req.body.text.split("watch?v=")[1];

		post.text = "https://youtube.com/embed/" + url;
		post.created_by = req.body.created_by;
		post.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})
	//gets all posts
	.get(function(req, res){
		Post.find(function(err, posts){
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
		});
	});

router.route('/upload_file')
	.post(function(req, res){
		console.log("-----file upload requested --------");
		upload(req, res, function(err) {
			if (err){
				console.log("Error: ", err);
				return res.end("Error upoading file");
			}
			console.log(res.req);
			console.log("success!");
			var file = new File();
			file.created_by = res.req.user.username;
			file.original_name = res.req.file.originalname;
			file.path = res.req.file.path;

			file.save(function(err, file){
				if (err){
					return res.send(500, err);
				}
				res.json(file);
			})


		})


	});


//post-specific commands. likely won't be used
router.route('/search')
	//gets specified post
	.get(function(req, res){
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		var search_string = req.query.search_string.trim();
		console.log(search_string);
		var result = {
			musician : [],
			music: []
		};

		Post.find({
			$or:[
				{created_by: search_string},
				{post_type: search_string},
				{text: search_string}
			]}).toArray(function(err, results){
				if(err){
					return res.send(err);
				}
				console.log(results)
				
				User.find({
					$or:[
						{created_by: search_string},
						{post_type: search_string},
						{username: search_string},
						{band_name: search_string},
						{user_type: search_string}
					]}).toArray(function(err, user){
					if(err){
						return res.send(err);
					}
					console.log(user)


					File.find({
						$or:[
							{created_by: search_string},
							{post_type: search_string},
							{text: search_string},
							{original_name: search_string}
						]}).toArray(function(err, file){
						if(err){
							return res.send(err);
						}
						console.log(file);
						alert("YAY");
					});
				});

			});

			
		});




//post-specific commands. likely won't be used
router.route('/posts/:id')
	//gets specified post
	.get(function(req, res){
		Post.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);
			res.json(post);
		});
	}) 
	//updates specified post
	.put(function(req, res){
		Post.findById(req.params.id, function(err, post){
			if(err)
				res.send(err);

			post.created_by = req.body.created_by;
			post.text = req.body.text;

			post.save(function(err, post){
				if(err)
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
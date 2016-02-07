var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Post = mongoose.model('Post');

// code setup to enable user file uploads 
var multer  =   require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/assets');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
})
 
var upload = multer({ storage: storage });




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

//upload file (for user profile page )
// router.route('/upload_file')
// 	.post(function(req, res){
// 		upload(req,res,function(err) {
// 	        if(err) {
// 	        	console.log("\n\nERROR \n\n");
// 	            return res.end("Error uploading file.");
// 	        }
// 	        console.log("\n\n================ FILE UPLOADED SUCCESSFULLY ===================\n\n");
// 	        res.end("File is uploaded");
//     });
// });


router.route('/posts')
	//creates a new post
	.post(function(req, res){

		var post = new Post();
		var url = req.body.text.split("watch?v=")[1];
		
		if(!url || url === "undefined" || typeof url != String){
			return res.send(500, err);
		}

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
		console.log('debug1');
		Post.find(function(err, posts){
			console.log('debug2');
			if(err){
				return res.send(500, err);
			}
			return res.send(200,posts);
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
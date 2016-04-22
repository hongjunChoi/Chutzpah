var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username : String, //username from api
	password : String, //hash created from password
	created_at: {type : Date, default : Date.now()}, //default will be time when user is created
	user_type : String,
	genre : String, 
	band_name : String,
	user_location : String
});

var postSchema = new mongoose.Schema({
	created_by: String,		//should be changed to ObjectId, ref "User"
	created_at: {type: Date, default: Date.now},
	post_location : String, 
	post_type : String,
	original_name: String,
	url: String,
	text: String,
	is_file: Boolean,
	num_likes: Number
});

var commentSchema = new mongoose.Schema({
	created_by: String,
	created_at: {type: Date, default: Date.now},
	post_id: String, 
	text: String,
});

var likeSchema = new mongoose.Schema({

});
mongoose.model('Comment', commentSchema);
//declaring model name POST with defined schema
mongoose.model('Post', postSchema);
//declaring a model with name "User" with schema user schema defined above
mongoose.model("User", userSchema);
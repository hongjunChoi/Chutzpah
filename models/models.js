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
	url: String,
	text: String
});


//declaring model name POST with defined schema
mongoose.model('Post', postSchema);
//declaring a model with name "User" with schema user schema defined above
mongoose.model("User", userSchema);
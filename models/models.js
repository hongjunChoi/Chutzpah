var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String, //username from api
    password: String, //hash created from password
    email: String,
    created_at: {
        type: Date,
        default: Date.now()
    }, //default will be time when user is created
    user_type: String, //artist/ venue/ none
    genre: String,
    name: String,
    user_location: String,
    user_description: String,
    soundcloud: String,
    website: String,
    img_url: String,
});

var tempUserSchema = new mongoose.Schema({
    username: String, //username from api
    password: String, //hash created from password
    email: String,
    created_at: {
        type: Date,
        default: Date.now()
    }, //default will be time when user is created
    user_type: String,
    genre: String,
    band_name: String,
    user_location: String,
    user_description: String,
});

var postSchema = new mongoose.Schema({
    created_by: String, //should be changed to ObjectId, ref "User"
    created_at: {
        type: Date,
        default: Date.now
    },
    images: [String],
    music_url: String,
    music_name: String,
    text: String,

    post_location: String,
    user_type: String, //artist: artist, venue: venue
    post_type: String,
    original_name: String,
    //    url: String,
    is_file: Boolean,
    is_request: Boolean,
    num_likes: {
        type: Number,
        default: 0
    }
});


var eventSchema = new mongoose.Schema({
    artist: String, //should be changed to ObjectId, ref "User"
    venue: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    time: String,
    location: String,
    genre: String,
    num_likes: Number
});

var commentSchema = new mongoose.Schema({
    created_by: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    post_id: {
        type: String,
        index: true
    },
    text: String,
});


var likeSchema = new mongoose.Schema({
    created_by: String,
    post_id: {
        type: String,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


var chatSchema = new mongoose.Schema({
    chat_type: String,
    chat_text: String,
    sent_to: String,
    sent_from: String,
    sent_at: {
        type: Date,
        default: Date.now
    },
    request_time: String,
    request_location: String,
    request_music_type: String

});

var notificationSchema = new mongoose.Schema({
    username: String,
    notification_time: {
        type: Date,
        default: Date.now
    }
})

//declaring a model with name with schema user schema defined above
mongoose.model("Like", likeSchema);
mongoose.model("Chat", chatSchema);
mongoose.model("Notification", notificationSchema);
mongoose.model('Comment', commentSchema);
mongoose.model('Post', postSchema);
mongoose.model("User", userSchema);
mongoose.model("Event", eventSchema);
mongoose.model("TempUser", tempUserSchema);

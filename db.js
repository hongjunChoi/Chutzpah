var mongoose = require('mongoose');
mongoose.connect('mongodb://scottljy:scottchoi92@ds017553.mlab.com:17553/heroku_w6zmj82b');
module.exports = mongoose.connection;

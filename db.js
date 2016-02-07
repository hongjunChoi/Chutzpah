var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/meanDB');
module.exports = mongoose.connection;
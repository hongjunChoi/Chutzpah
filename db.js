var mongoose = require('mongoose');

var options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

var mongodbUri = 'mongodb://scottljy:scottchoi92@ds017553.mlab.com:17553/heroku_w6zmj82b';

mongoose.connect(mongodbUri, function(err) {
    console.log('\n\n\n CONNECTED TO MLAB \n\n\n\n')
    if (err) {
        console.log("Error is " + err);
        throw err;
    }

});


module.exports = mongoose.connection;

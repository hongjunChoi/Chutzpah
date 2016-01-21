//necessary imports
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');

//initialize mongoose schemas
require('./models/models');
var index = require('./routes/index');
var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);
var app = express();
var mongoose = require('mongoose');
//connect to database && set up express 
var db = require('./db'); 
var User = mongoose.model('User');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));


//session store variable for user sessions
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore(
    { 
        mongooseConnection  : mongoose.connection
    }
);


// // Catch errors
store.on('error', function(error) {
//TODO : ERROR HANDLING ON MONGODB SESSIONS
    console.log('\n\n\n\nerror found on mongo db session store : ' + error + '\n\n\n\n');  
//     assert.ifError(error);
//     assert.ok(false);
});


//configure db for session storage
app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 weeks max session time 
    },
    store: store,
    resave : false,
    saveUninitialized : false
}));


//middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());


//routing define
app.use('/', index); //root homepage
app.use('/auth', authenticate); //login related 
app.use('/api', api); //other apis


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


//// Initialize Passport
var initPassport = require('./passport-init');
initPassport(passport);


// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
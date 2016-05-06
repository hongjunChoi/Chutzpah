//necessary imports
var express = require('express');
var path = require('path');
var http = require('http');
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

//connect to database && set up express 
var db = require('./db');
var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));


//session store variable for user sessions
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
    mongooseConnection: mongoose.connection
});


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
    resave: false,
    saveUninitialized: false
}));


//middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());


//routing define
app.use('/', index); //root homepage
app.use('/auth', authenticate); //login related 
app.use('/api', api); //other apis


// port needs to change in production environment
var port = 3000;
var server = http.createServer(app);
server.listen(port);

//chat room socket io environment 
var io = require('socket.io')(server);

io.sockets.on('connection', function(socket) {
    var current_chat_user = "";
    socket.on('join', function(data) {
        socket.join(data.username); // We are using room of socket io
        current_chat_user = data.username;
    });

    // the client disconnected/closed their browser window
    socket.on('disconnect', function(data) {
        // Leave the room!
        console.log("==== fuck yeah======")
        console.log(current_chat_user);

        Notification.find({
            username: current_chat_user
        }, function(err, time) {
            if (err) {
                console.log("ERROR IN FINDING NOTIFICAtiON ON disconnect");
            }
            if (time.length == 0) {
                var notification = new Notification();
                notification.username = current_chat_user;
                notification.notification_time = Date.now();
                notification.save(function(err, notification) {
                    if (err) {
                        console.log("ERROR IN SAVE NOTI");
                    }
                    console.log("SUCCESSFULLY SAVED CREATED NOTI");
                    console.log(notification);
                });
            } else {
                Notification.update({
                    username: current_chat_user
                }, {
                    notification_time: Date.now()
                }, function(err, new_time) {
                    if (err) {
                        console.log("ERROR IN UPDATE NOTI");
                    }
                    console.log("SUCCESSFULLY UPDATED NOTIFICATION TIME");
                    console.log(new_time);
                });

            }
        })

    });
});


//API CALLS FOR CHATTING
//get room html 
app.get('/get_chat', function(req, res) {
    var user = req.query.user_name;
    Notification.find({
        username: user
    }, function(err, notification) {
        if (err) {
            return res.send(500, err);
        }
        console.log("fuck")
        var last_date = notification[0].notification_time;

        Chat.find({
            sent_to: user,
            sent_at: {
                $lt: last_date
            }
        }, function(err, new_chats) {
            if (err) {
                res.send(500, err);
            }
            Chat.find({
                sent_to: user,
                sent_at: {
                    $gte: last_date
                }
            }, function(err, old_chat) {
                if (err) {
                    return res.send(500, err);
                }
                data = {
                    "newchat": new_chats,
                    "oldchat": old_chat
                }

                return res.send(200, data);
            });
        })
    });


    console.log("==== end of get chat =====")


});


app.post('/send_chat', function(req, res) {
    console.log("===========  send chat ==============  ");
    var sent_from = req.body.sent_from;
    var sent_to = req.body.sent_to;
    var text = req.body.text;
    var type = req.body.chat_type;
    var request_music_type = req.body.request_music_type;
    var request_time = req.body.request_time;
    var request_location = req.body.request_location;


    var chat = new Chat();
    chat.sent_to = sent_to;
    chat.sent_from = sent_from;
    chat.chat_text = text;
    chat.sent_at = Date.now();
    chat.chat_type = type;

    if (type == "request") {
        console.log("@!@@#@@#$#@#@")
        chat.request_location = request_location;
        chat.request_time = request_time;
        chat.request_music_type = request_music_type;
    }

    chat.save(function(err, p) {
        if (err) {
            return res.send(500, err);
        }
        //now sent to socket io before returning response
        var id = p["_id"];
        if (type == "request") {
            io.sockets.in(sent_to).emit('new_msg', {
                id: id,
                msg: text,
                from: sent_from,
                type: type,
                time: request_time,
                location: request_location,
                music_type: request_music_type
            });

        } else {
            io.sockets.in(sent_to).emit('new_msg', {
                id: id,
                msg: text,
                from: sent_from,
                type: type
            });
        }
        res.json(p);
    });

});



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



// module.exports = app;
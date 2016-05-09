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
var nev = require('email-verification')(mongoose);

// view engine setup
var engines = require('consolidate');

app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));


//session store variable for user sessions
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
    mongooseConnection: mongoose.connection
})



nev.configure({
    persistentUserModel: User,
    tempUserCollection: 'tempcollections',

    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'hyun_chang_song@brown.edu',
            pass: '1547Sean'
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply <StageLight>',
        subject: 'Please confirm account',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
});

nev.generateTempUserModel(User);

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



function loggedIn(req, res, next) {
    console.log("------")
    console.log(req.user)
    console.log("------")

    console.log(req.session)

    if (req.user || req.session.user) {
        next();
    } else {
        res.redirect('/#login');
    }
}

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
        console.log(current_chat_user);
        update_notification(current_chat_user, null);
    });
});



//API CALLS FOR CHATTING
function update_notification(current_chat_user, res) {
    console.log("updating notification ... user : " + current_chat_user);
    Notification.find({
        username: current_chat_user
    }, function(err, time) {
        if (err) {
            console.log("ERROR IN FINDING NOTIFICAtiON ON disconnect");
            if (res) {
                return res.send(500, "error in updating notification time");
            }

        }
        if (time.length == 0) {
            var notification = new Notification();
            notification.username = current_chat_user;
            notification.notification_time = Date.now();
            notification.save(function(err, notification) {
                if (err) {
                    console.log("ERROR IN SAVE NOTIFICATION (CREATED NEW ONE)");
                    if (res) {
                        return res.send(500, "error in updating notification time");
                    }
                }
                console.log("SUCCESSFULLY SAVED CREATED NOTIFICATION");
                if (res) {
                    return res.send(200, "notification updated successfully");
                }
            });
        } else {
            Notification.update({
                username: current_chat_user
            }, {
                notification_time: Date.now()
            }, function(err, new_time) {
                if (err) {
                    console.log("ERROR IN UPDATE NOTIFICATION");
                    if (res) {
                        return res.send(500, "error in updating notification time");
                    }
                }
                console.log("SUCCESSFULLY UPDATED NOTIFICATION TIME");
                console.log(new_time);
                if (res) {
                    return res.send(200, "notification updated successfully");
                }
            });
        }
    });
}



app.post('/update_notification', loggedIn, function(req, res) {

    var current_chat_user = req.body.current_user;
    update_notification(current_chat_user, res);

});


//get room html 
app.get('/get_chat', loggedIn, function(req, res) {
    var user = req.query.user_name;
    Notification.find({
        username: user
    }, function(err, notification) {
        if (err) {
            return res.send(500, err);
        }

        var last_date = notification[0].notification_time;

        Chat.find({

            $or: [{
                sent_to: user,
                sent_at: {
                    $lt: last_date
                }
            }, {
                sent_from: user,
                sent_at: {
                    $lt: last_date
                }
            }]

        }).sort({
            sent_at: 1
        }).exec(function(err, new_chats) {

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
        });
    });


    console.log("==== end of get chat =====")


});


app.post('/send_chat', loggedIn, function(req, res) {
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
        console.log("@!@@#@@#$#@#@");
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
                chat_type: type
            });
        }

        res.json(p);
    });

});


app.get('/verify', function(req, res) {
    var id = req.query.id;
    console.log(id)
    console.log("-------- verifying ------- ")

    mongoose.connection.db.collection("tempcollections", function(err, collection) {
        collection.find({
            "_id": mongoose.Types.ObjectId(id)
        }).toArray(function(err, items) {
            console.log(items);
            if (items.length == 0) {
                res.redirect('/#/signup')
            } else {
                nev.confirmTempUser(items[0].GENERATED_VERIFYING_URL, function(err, user) {
                    if (err) {
                        console.log('Error in Confirming user: ' + err);
                    }
                    if (user) {
                        user.save(function(err) {
                            if (err) {
                                console.log('Error in Saving user: ' + err);
                                throw err;
                            }
                            console.log("YAY!!!!!!!!!!!!!")
                            var user_data = {
                                "_id": user["_id"],
                                "user_location": user["user_location"],
                                "user_type": user["user_type"],
                                "username": user["username"]
                            };
                            req.session.authenticated = true;
                            req.session.username = user.username;
                            req.session.user = user_data;
                            console.log(req.session)
                            console.log("-------------REDIRECTING")
                            res.redirect('/');
                        });
                    } else {
                        console.log("sign up again please\n")
                        res.redirect('/#/signup')
                    }
                });
            }
        });
    });

    // tempUser.findOne({
    //     '_id': id
    // }, )
    // cursor.each(function(err, doc) {
    //     if (doc != null) {
    //         console.log("----------- doc not nil")
    //         nev.confirmTempUser(doc.GENERATED_VERIFYING_URL, function(err, user) {
    //             if (err) {
    //                 console.log('Error in Confirming user: ' + err);
    //             }
    //             if (user) {
    //                 user.save(function(err) {
    //                     if (err) {
    //                         console.log('Error in Saving user: ' + err);
    //                         throw err;
    //                     }
    //                     console.log("YAY!!!!!!!!!!!!!")
    //                     res.redirect('/' + user._id);
    //                 });
    //             } else {
    //                 console.log("sign up again please\n")
    //                 res.redirect('/#/signup')
    //             }
    //         });
    //     } else {
    //         console.log("=================== doc nil")
    //         res.redirect('/#/signup')
    //     }
    // });

});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



//// Initialize Passport
var initPassport = require('./passport-init');
initPassport(passport, nev);


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

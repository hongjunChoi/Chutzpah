var mongoose = require('mongoose');
var User = mongoose.model('User');
var TempUser = mongoose.model('TempUser')
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var nev = require('email-verification')(mongoose);





module.exports = function(passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        // console.log('serializing user:',user.username);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            // console.log('deserializing user:',user.username);
            done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            // check in mongo if a user with username exists or not
            User.findOne({
                    'username': username
                },
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user) {
                        console.log('User Not Found with username ' + username);
                        return done(null, false);
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)) {
                        console.log('Invalid Password');
                        return done(null, false); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success

                    //save user to session
                    return done(null, user);
                }
            );
        }
    ));

    passport.use('verify_email', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            console.log("----------------")
            var url = 'localhost:3000/auth/email-verification/' + req.params.username;
            nev.confirmTempUser(url, function(err, user) {
                if (err) {
                    console.log('Error in Confirming user: ' + err);
                }
                if (user) {
                    user.save(function(err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            throw err;
                        }
                        //redirect to profile
                        return done(null, user);
                    });
                } else {
                    console.log("sign up again please\n")
                }
                // redirect to sign-up 
            });
        }));

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            // find a user in mongo with provided username
            User.findOne({
                'username': username
            }, function(err, user) {
                // In case of any error, return using the done method
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: ' + username);
                    return done(null, false);
                } else {
                    // if there is no user, create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.username = username;
                    newUser.password = createHash(password);
                    newUser.email = req.body.email;
                    newUser.user_location = req.body.location;
                    newUser.user_type = req.body.user_type;
                    newUser.user_description = req.body.description;
                    newUser.name = req.body.name;

                    var user_type = req.body.user_type

                    if (user_type == "artist") {
                        newUser.genre = req.body.genre;
                        newUser.soundcloud = req.body.soundcloud;
                    }
                    if (user_type == "venue") {
                        newUser.name = req.body.name;
                        newUser.website = req.body.website;
                    }
                    if (user_type == "fan") {
                        newUser.genre = req.body.genre;
                    }


                    var url = "localhost:3000/auth/email-verification/" + username
                    nev.configure({
                        verificationURL: url,
                        persistentUserModel: User,
                        tempUserModel: TempUser,
                        tempUserCollection: 'myawesomewebsite_tempusers',

                        transportOptions: {
                            service: 'Gmail',
                            auth: {
                                user: 'hyun_chang_song@brown.edu',
                                pass: '1547Sean'
                            }
                        },
                        verifyMailOptions: {
                            from: 'Do Not Reply <myawesomeemail_do_not_reply@gmail.com>',
                            subject: 'Please confirm account',
                            html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
                            text: 'Please confirm your account by clicking the following link: ${URL}'
                        }
                    });

                    // nev.createTempUser(newUser, function(err, newTempUser) {
                    //     if (err) {
                    //         console.log("----error in creating tempuser", err)
                    //     }
                    //     if (newTempUser) {
                    //         nev.registerTempUser(newTempUser, function(err) {
                    //             if (err) {
                    //                 console.log("----error in registering tempuser", err)
                    //             }
                    //             console.log("----successfully created temp user")
                    //             //  return done(null, null)
                    //         });
                    //     } else {
                    //         console.log("failure in creating for somereason")
                    //     }
                    //     console.log(newTempUser)
                    // });

                    newUser.save(function(err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            return done(null, null)
                            throw err;
                        }
                        //redirect to profile
                        return done(null, newUser);
                    });
                }
            });
        }));

    var isValidPassword = function(user, password) {
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};
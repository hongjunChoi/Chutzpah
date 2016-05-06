var express = require('express');
var router = express.Router();

module.exports = function(passport) {

    //sends successful login state back to angular
    router.get('/success', function(req, res) {
        if (req.user) {
            var user_data = {
                "_id": req.user["_id"],
                "user_location": req.user["user_location"],
                "user_type": req.user["user_type"],
                "username": req.user["username"]
            };
            req.session.user = user_data;
            data = {
                "user": user_data,
                "state": "success"
            }
            res.send("success", data);

        } else {
            res.send("success", null);
        }

    });

    //sends failure login state back to angular
    router.get('/failure', function(req, res) {
        res.send({
            state: 'failure',
            user: null,
            message: "Invalid username or password"
        });
    });

    //log in
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //sign up
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    router.get('/email-verification/:username', passport.authenticate('verify_email'));


    //sends user session if there is one
    router.get('/session', function(req, res) {
        if (req.user) {
            var user_data = {
                "_id": req.user["_id"],
                "user_location": req.user["user_location"],
                "user_type": req.user["user_type"],
                "username": req.user["username"]
            };

            data = {
                "user": user_data,
                "state": "success"
            };
            res.send("success", data);

        } else {
            res.send("success", null);
        }
    });

    //log out
    router.get('/signout', function(req, res) {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    });

    return router;

}
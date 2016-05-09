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
        successRedirect: '/auth/email-verification',
        failureRedirect: '/auth/failure',
    }));

    router.get('/email-verification', function(req, res) {
        res.send({
            state: 'success',
            user: null,
            message: "email-sent"
        });
    });


    //sends user session if there is one
    router.get('/session', function(req, res) {
        console.log("------SESSION-------")
        console.log(req.session)

        console.log(req.session.user)

        console.log("------SEad0fa=sdfi=dsaifsSSION-------")
        user = req.session.user
        if (user) {
            var user_data = {
                "_id": user["_id"],
                "user_location": user["user_location"],
                "user_type": user["user_type"],
                "username": user["username"],
                "img_url": user["img_url"]
            };

            data = {
                "user": user_data,
                "state": "success"
            };
            console.log(data)
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

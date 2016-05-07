var express = require('express');
var router = express.Router();

//when root homeweb site is called "/" -> go to root main html homepage
router.get('/', function(req, res) {
    console.log("==============================")
    console.log(req.session);
    if (req.session.authenticated) {
        res.render('index', {
            title: 'website title'
        });
    } else {
        res.redirect('/auth/signin');
    }
});

module.exports = router;
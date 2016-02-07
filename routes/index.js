var express = require('express');
var router = express.Router();

//when root homeweb site is called "/" -> go to root main html homepage
router.get('/', function(req, res){
	console.log(req.session);
	res.render('index', {title : 'website title' });
});


module.exports = router;

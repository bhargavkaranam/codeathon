var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
var index = {
	perform : function(req,res,next) {
		if(req.session.email)
		{
			res.redirect('/main');
		}
		else
		{
			res.redirect('/login');
			
		}

	},
	test : function(req,res) {
		if(!req.session.email)
			return res.redirect('/login');
		res.sendFile(path.join(__dirname,'../views/','main.html'));
	}
};

module.exports = index;

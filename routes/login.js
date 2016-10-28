var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var config = require('./config');
var login = {
	checkCredentials : function(req,res) {
		
		var email = req.body.email;
		var password = req.body.password;
		var connection = config.connect();
		var sql = "SELECT Email FROM registrations WHERE Email = " + connection.escape(email) + " and Password = " + connection.escape(password);

		connection.query(sql,function(err,rows,fields){
			if(rows.length)
			{
				res.json({status : 'true'});
			}
			else
				res.json({status : 'false'});
		});

		
		
	}
};

module.exports = login; 
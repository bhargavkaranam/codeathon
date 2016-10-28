var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var config = {
	connect : function() {
		var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '12345678',
			database : 'codeathon'
		});
		
		return connection;
	}
};

module.exports = config;
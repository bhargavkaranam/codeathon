var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var path = require('path');
var config = require('./config');
var team = require('./team');
var user = require('./user');

var model = {

	fetch : function(req,res) {		
		var connection = config.connect();
		var uid = req.session.uid;
		var tid = team.teamIdFromUserId(uid);
		var mno = team.currentModel(tid);
		var sql = "SELECT * FROM models WHERE mno = " + mno;
		connection.query(sql,function(err,rows,fields){

			if(!err)
				res.json({
					story : rows[0].story,				
				});

		});
	},

	fetchAll : function(req,res) {
		
		if(!req.session.email)		
			res.redirect('/login');
		var email = req.session.email;

		
		var connection = config.connect();

		team.teamIdFromUserId(email, function(teamid) {
			var sql = "SELECT mno FROM teams WHERE tid = " + teamid;

			connection.query(sql,function(err,results,fields){

				if(!err && results.length)
				{
					var mno = results[0].mno;
					
					var sql = "SELECT mno,story FROM models WHERE active = 1 and mno <= " + mno;
					connection.query(sql,function(err,results,fields){
						res.json(results);
					});
				}
				
			});
		});
	},


	
};

module.exports = model;
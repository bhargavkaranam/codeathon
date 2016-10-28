var express = require('express');
var router = express.Router();
var config = require('./config');
var mysql = require('mysql');
var path = require('path');
var team = {

	teamMembers : function() {

	},

	currentQuestion : function() {

	},

	currentModel : function() {
		var uid = req.session.uid;

	},

	score : function() {

	},

	teamIdFromUserId : function(email, callback) {
		var connection = config.connect();

		var sql = "SELECT tid FROM registrations WHERE email = " + connection.escape(email);

		connection.query(sql,function(err,rows,fields){
			if(!err)
			{
				var teamid = rows[0].tid;

				if(callback) {
					return callback(teamid);
				}
			}
		});		
	},

	register : function(req,res) {
		if(req.body.pass != "ionsucks")
			return res.json({message : 'Invalid password'})

		var connection = config.connect();
		var emails = req.body.email.split(',');
		var teamSize = emails.length;
		for(var i = 0;i < emails.length;i++)
			if(emails[i] == "")
				teamSize--;

		var insert = {name : req.body.name,qno : 1,score : 0};		
		connection.beginTransaction(function(err){

			var query = connection.query('INSERT INTO teams SET ?',insert,function(err,result){
				
				if(!err)
				{
					var array = [result.insertId,emails[0],emails[1],emails[2],emails[3]];
					
					var sql = "UPDATE registrations SET tid = ? WHERE Email = ? OR Email = ? OR Email = ? OR Email = ?";
					connection.query(sql,array,function(err,results){
						
						if(results.changedRows != teamSize)
						{
							return connection.rollback(function(){
								res.json({status : 'false',message : 'One of the emails is incorrect'});
							});
						}
						else
						{
							if(!err)
							{
								connection.commit(function(err){
									if(!err)
										res.json({status : 'true',message : 'Successfully registered'});
								});
							}
							else
							{							
								return connection.rollback(function(){
									res.json({status : 'false',message : 'Successfully registered'});
								});
							}
						}
					});

				}
				else
				{
					return connection.rollback(function(){
						res.json({status : 'false',message : 'Team name already exists'});	
					});
				}
			});
		});
	},

	render : function(req,res) {
		res.sendFile(path.join(__dirname,'../views/','teamregister.html'));
	}



};

module.exports = team;
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var config = require('./config');
var md5 = require('js-md5');
var fs = require('fs');
var team = require('./team');
var path = require('path');
var formidable = require('formidable');
var user = {

	userDetails : function() {

	},

	changePassword : function() {

	},
	logout : function() {

	},
	getUserId : function(username) {
		var connection = config.connect()
		var sql = "SELECT t.uid FROM team_details t,registrations r WHERE r.email = " + connection.escape(username) + " AND t.uid = r.id";
		connection.query(sql,function(err,rows,fields){			
			if(!err)		
			{
				console.log(rows[0].uid);
				return rows[0].uid;
			}

		});
	},
	login : function(req,res) {
		if(req.body.username && req.body.password)
		{
			var connection = config.connect();

			var sql = "SELECT email FROM registrations WHERE email = " + connection.escape(req.body.username) + " AND password = " + connection.escape(md5(req.body.password));
			connection.query(sql,function(err,rows,fields){
				if(!err)
				{
					if(rows.length)
					{
						req.session.email = req.body.username;
						res.redirect('/main');
					}
					else
					{
						res.redirect('/login');
					}
				}
				else
					console.log(err);
			})			
		}
		else
			res.redirect('/login');
	},
	register : function(req,res) {
		if(req.body.email && req.body.password && req.body.tid)
		{
			var connection = config.connect();
			var sql = "UPDATE registrations SET password = " + connection.escape(md5(req.body.password)) + " and tid = " + connection.escape(req.body.tid);
			connection.query(sql,function(err,results){
				
			});
		}
	},

	submitcode : function(req,res) {
		if(!req.session.email)
			return res.json({status : 'false',code : '103'});
		if(!req.body.code || !req.body.qno)
			return res.json({message : 'Invalid access'});
		var code = JSON.parse(req.body.code);
		var connection = config.connect();
		var qno = connection.escape(req.body.qno);

		var fileName = Date.now() + req.session.email + ".txt";
		team.teamIdFromUserId(req.session.email, function(teamid) {
			fs.writeFile(path.join(__dirname,'../codes/',fileName),code,function(err){
				if(!err)
				{
					var sql = "SELECT tid FROM submissions WHERE qno = " + qno + " AND tid = " + teamid;

					connection.query(sql,function(err,rows,fields){
						if(!err)
						{
							if(rows.length)
							{

								var sql = "UPDATE submissions SET code = ?, email = ? WHERE tid = ? AND qno = ?";								
								connection.query(sql,[fileName,req.session.email,teamid,req.body.qno],function(err,results){
									

									if(!err)
									{
										var sql = "SELECT MAX(qno) FROM submissions WHERE tid = " + teamid;
										connection.query(sql,function(err,rows,fields){
											var sql = "UPDATE teams SET qno = " + (rows[0].qno + 1) + " WHERE tid = " + teamid;
											connection.query(sql,function(err,rows,fields){
												if(!err)
													res.json({status : 'true'});
											})
										});
										
									}
									else
									{										
										res.json({status : 'false'});
									}
								});
							}
							else
							{
								
								var insert = {tid : teamid,email:req.session.email,code:fileName,qno : req.body.qno};
								connection.query("INSERT INTO submissions SET ?",insert,function(err,result){
									if(!err)
									{
										var sql = "SELECT MAX(qno) FROM submissions WHERE tid = " + teamid;
										connection.query(sql,function(err,rows,fields){
											var sql = "UPDATE teams SET qno = " + (rows[0].qno + 1) + " WHERE tid = " + teamid;
											connection.query(sql,function(err,rows,fields){
												if(!err)
													res.json({status : 'true'});
											})
										});
									}
									else
										res.json({status : 'false'});
								});
							}
						}
						else
						{
							
							res.json({status : 'false1'});
						}
					});
					
				}
				else
					res.json({status : 'false2'});
			});
		});
	},
	
	uploadcode : function(req,res) {
		if(!req.session.email)
			return res.json({status : 'false',code : 103});
		var qno;
		var form = new formidable.IncomingForm();
		team.teamIdFromUserId(req.session.email, function(teamid) {
			var connection = config.connect();
			form.multiples = true;
			form.on('field',function(name,value){
				qno = value;
			})

			form.uploadDir = path.join(__dirname, '../codes');


			form.on('file', function(field, file) {
				var fileName = Date.now() + req.session.email + file.name;
				fs.rename(file.path, path.join(form.uploadDir, fileName),function(err){
					if(!err)
					{
						var sql = "SELECT tid FROM submissions WHERE qno = " + qno + " AND tid = " + teamid;

						connection.query(sql,function(err,rows,fields){
							if(!err)
							{
								if(rows.length)
								{

									var sql = "UPDATE submissions SET code = ? , email = ? WHERE tid = ? AND qno = ?";
									
									connection.query(sql,[fileName,req.session.email,teamid,qno],function(err,results){


										
										if(err)
										{
											
											return res.json({status : 'false'});
										}
									});
								}
								else
								{

									var insert = {tid : teamid,email:req.session.email,code:fileName,qno : qno};
									connection.query("INSERT INTO submissions SET ?",insert,function(err,result){
										if(err)
											return res.json({status : 'false'});
									})
								}
							}
							else
							{

								return res.json({status : 'false1'});
							}
						});
					}
				});
			});


			form.on('error', function(err) {
				res.json({status : 'false','message' : 'Error in uploading'});
			});


			form.on('end', function() {
				res.json({status : 'true'});
			});


			form.parse(req);
		});

	},

	getdetails : function(req,res) {
		var email = req.session.email;
		console.log(email);
		if(email)
		{
			team.teamIdFromUserId(req.session.email, function(teamid) {
				var connection = config.connect();
				var sql = "SELECT name FROM teams WHERE tid = " + teamid;
				connection.query(sql,function(err,rows,fields){
					if(!err)
					{
						if(rows.length)
						{
							res.json({username : email,teamname : rows[0].name});
						}
					}
				});
			});
		}
	},

	renderpage : function(req,res) {
		if(!req.session.email)
			res.sendFile(path.join(__dirname,'../views/','login.html'));
		else
			res.redirect('/main');
	},

	sendNotifications : function(req,res) {
		if(req.session.email)
		{
			if(!req.session.lastchecked)
				req.session.lastchecked = 0;
			var connection = config.connect();

			var sql = "SELECT text FROM notifications WHERE timestamp <= " + Date.now() +" AND timestamp >" + req.session.lastchecked;							
			connection.query(sql,function(err,rows,fields){
				if(!err)
				{
					req.session.lastchecked = Date.now();
					res.json({notification : rows});
				}
			})
		}

	}


};

module.exports = user;
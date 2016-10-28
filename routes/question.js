var express = require('express');
var router = express.Router();
var config = require('./config');
var team = require('./team');

var question = {
	fetch : function(req,res) {
		
		if(req.session.email)
		{
			var email = req.session.email;
			
			var response = [];
			var connection = config.connect();

			team.teamIdFromUserId(email, function(teamid) {
				var sql = "SELECT qno FROM teams WHERE tid = " + teamid;

				connection.query(sql,function(err,results,fields){

					if(!err && results.length)
					{
						var qno = results[0].qno;
						
						var sql = "SELECT question,qno,testcases,hints FROM questions WHERE (open = 1 AND active = 1) OR (active = 1 AND qno <= " + (qno + 1) + ")";
						connection.query(sql,function(err,results,fields){

							res.json(results);
						});
					}

				});
			});
		}
	},

};

module.exports = question;
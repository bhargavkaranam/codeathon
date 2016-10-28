var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var fs = require('fs');
var xlsx = require('node-xlsx');
var path = require('path');
var check = {

	execute : function(req,res) {
		
		var compileMessage;
		var code = JSON.parse(req.body.code);
		var workSheetsFromFile = xlsx.parse(path.join(__dirname,'../excel-sheets/','inputoutput1.xlsx'));
		console.log(workSheetsFromFile);
		// function runOnHackerrank()
		// {
		// 	unirest.post("http://api.hackerrank.com/checker/submission.json")
		// 	.header("Content-Type", "application/x-www-form-urlencoded")
		// 	.header("Accept", "application/json")
		// 	.send("api_key=hackerrank|325413-990|83623591e34fef6be59bf83cc57d4e0edc692d90")
		// 	.send("callback_url=https://iecsemanipal.com")
		// 	.send("format=json")
		// 	.send("lang=2")
		// 	.send('source=' + code)
		// 	.send('testcases=["2", "4"]')
		// 	.send("wait=true")
		// 	.end(function (response) {
		// 		var compileMessage = response.body.result['compilemessage'];			
		// 		res.json({'message' : compileMessage});
		// 	});
		// }
	},

	compile : function(req,res) {
		var code = JSON.parse(req.body.code);
		var compileMessage;
		var code = JSON.parse(req.body.code);

		unirest.post("http://api.hackerrank.com/checker/submission.json")
		.header("Content-Type", "application/x-www-form-urlencoded")
		.header("Accept", "application/json")
		.send("api_key=hackerrank|325413-990|83623591e34fef6be59bf83cc57d4e0edc692d90")
		.send("callback_url=https://iecsemanipal.com")
		.send("format=json")
		.send("lang=2")
		.send('source=' + code)
		.send('testcases=[]')
		.send("wait=true")
		.end(function (response) {
			
			var compileMessage = response.body.result['compilemessage'];			
			res.json({'message' : JSON.stringify(compileMessage)});
		});	
	}
};

module.exports = check;
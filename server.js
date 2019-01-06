var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://anson:password01@ds249824.mlab.com:49824/random-lunch-list';
var assert = require('assert');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var cors = require('cors')
app.use(cors());
 
app.get('/getFullList', function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		cursor = myDB.collection("restaurant").find().sort({properties : 1, order: 1 });
		var returnObject = [];
		cursor.each(function(err, doc) {
			assert.equal(err, null);
			if (doc != null) {
				returnObject.push(doc);
            } else {
            	res.send(returnObject);
            }
		});
	});
});

app.get('/getUser', function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		cursor = myDB.collection("user").find();
		var returnObject = [];
		cursor.each(function(err, doc) {
			assert.equal(err, null);
			if (doc != null) {
				returnObject.push(doc);
            } else {
            	res.send(returnObject);
            }
		});
	});
});

app.post('/updateFullList', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		var obj = req.body;
		var counter = 0;
		console.log(obj);
		for (var key in obj) {
			for(var i in obj[key]){
				console.log(obj[key][i]);
				myDB.collection("restaurant").update({name:obj[key][i]},{$set:{"properties":key,"order":i}}, function(err, result) {
					assert.equal(err, null);
					counter++;
					if(counter==obj["fullListLength"]){
						console.log(counter);
						res.send("ok");
					}
				});
			}
	    }
	});
});
 
app.listen(process.env.PORT || 8099);
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://anson:password01@ds249824.mlab.com:49824/random-lunch-list';
var assert = require('assert');

var cors = require('cors')
app.use(cors());
 
app.get('/getFullList', function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		cursor = myDB.collection("restaurant").find();
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
 
app.listen(process.env.PORT || 8099);
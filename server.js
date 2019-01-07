var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://anson:password01@ds249824.mlab.com:49824/random-lunch-list';
var assert = require('assert');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var cors = require('cors')
app.use(cors());
 
app.get('/getFullList/:order', function (req, res) {
	console.log("whyyyy");
	var order = req.params.order;
	console.log(order);
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		var sort = {};
		if(order=="true"){
			sort = {name : 1 };
		}else{
			sort = {properties : 1, order: 1 };
		}
		cursor = myDB.collection("restaurant").find().sort(sort);
		var returnObject = [];
		cursor.each(function(err, doc) {
			assert.equal(err, null);
			if (doc != null) {
				returnObject.push(doc);
            } else {
            	database.close();
            	res.send(returnObject);
            }
		});
	});
});

app.get('/getMemberList', function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		cursor = myDB.collection("user").find().sort({name : 1 });
		var returnObject = [];
		cursor.each(function(err, doc) {
			assert.equal(err, null);
			if (doc != null) {
				returnObject.push(doc);
            } else {
            	database.close();
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
            	database.close();
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
		for (var key in obj) {
			for(var i in obj[key]){
				var properties = "";
				if(obj["pickOk"]!=null&&obj[key][i]==obj["pickOk"]){
					console.log("piclok");
					properties = "picked";
				}else{
					console.log("key");
					properties = key;
				}
				myDB.collection("restaurant").update({name:obj[key][i]},{$set:{"properties":properties,"order":i}}, function(err, result) {
					assert.equal(err, null);
					counter++;
					if(counter==obj["fullListLength"]){
						console.log(counter);
						if(obj["pickOk"]!=null){
							var historyObj = {
								name: obj["pickOk"],
								time: new Date().getTime()
							}
							myDB.collection("history").insert(historyObj,function(err, result) {
								assert.equal(err, null);
								database.close();
								res.send("ok");			
							});
						}else{
							database.close();
							res.send("ok");
						}
					}
				});
			}
	    }
	});
});

app.post('/reset', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		myDB.collection("restaurant").updateMany({},{$set:{"properties":"notPicked","order":0}}, function(err, result) {
			assert.equal(err, null);
			database.close();
			res.send("ok");
		});
	});
});

app.post('/delete', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		var obj = req.body;
		var myquery = { name: { $in: obj } };
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		myDB.collection("restaurant").deleteMany(myquery, function(err, result) {
			assert.equal(err, null);
			database.close();
			res.send("ok");
		});
	});
});

app.post('/deleteMember', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		var obj = req.body;
		var myquery = { name: { $in: obj } };
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		myDB.collection("user").deleteMany(myquery, function(err, result) {
			assert.equal(err, null);
			var counter = 0;
			for(i in obj){
				myDB.collection("restaurant").updateMany({properties:obj[i]},{$set:{"properties":"notPicked","order":0}}, function(err, result) {
					assert.equal(err, null);
					counter++;
					if(counter==obj.length){
						console.log(counter);
						database.close();
						res.send("ok");
					}
				});
			}
		});
	});
});

app.post('/add', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		var obj = req.body;
		var array = obj.text.split("\n")
		var dbObj = [];
		for(var i in array){
			dbObj.push({name:array[i],properties:"notPicked",order:0});
		}
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		myDB.collection("restaurant").insertMany(dbObj, function(err, result) {
			assert.equal(err, null);
			database.close();
			res.send("ok");			
		});
	});
});

app.post('/addMember', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		var obj = req.body;
		var name = obj.text;
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		myDB.collection("user").insert({name:name}, function(err, result) {
			assert.equal(err, null);
			database.close();
			res.send("ok");			
		});
	});
});

app.get('/getHistory', function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		cursor = myDB.collection("history").find().sort({time:-1});//.limit(3).skip(3);
		var returnObject = [];
		cursor.each(function(err, doc) {
			assert.equal(err, null);
			if (doc != null) {
				var time = doc.time;
				var a = new Date(time+28800000);
				var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
				var year = a.getFullYear();
				var month = months[a.getMonth()];
				var date = a.getDate();
				var hour = a.getHours();
				var min = a.getMinutes();
				var sec = a.getSeconds();
				var days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']; 
				var dayNum = a.getDay();
				var result = days[dayNum];
				var time = year+"年"+month+"月"+date+'日'+" "+hour + ':' + min + ':' + sec +' '+result;
				returnObject.push({name:doc.name,time:time,utc:doc.time});
            } else {
            	database.close();
            	res.send(returnObject);
            }
		});
	});
});
app.post('/deleteHistory', jsonParser, function (req, res) {
	MongoClient.connect(mongourl, function(err, database) {
		var obj = req.body;
		var time = obj.time;
		const myDB = database.db('random-lunch-list');
		assert.equal(err, null);
		myDB.collection("history").remove({time:Number(time)}, function(err, result) {
			assert.equal(err, null);
			database.close();
			res.send("ok");
		});
	});
});
app.listen(process.env.PORT || 8099);
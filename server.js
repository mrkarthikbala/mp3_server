// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();

var User = require('./models/user');
var Task = require('./models/task');

//replace this with your Mongolab URL
mongoose.connect('mongodb://joe:joepass@ds041140.mongolab.com:41140/karthik');
// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// All our routes will start with /api
app.use('/api', router);



//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//additional routes
var userRoute = router.route('/users');
var singleUserRoute = router.route('/users/:id');
var taskRoute = router.route('/tasks');
var singleTaskRoute = router.route('/tasks/:id');

userRoute.get(function(req, res, next){

	var where = null;
	if (req.query.where) where = JSON.parse(req.query.where);
	var sort = null;
	if (req.query.sort) sort = JSON.parse(req.query.sort);
	var select = null;
	if (req.query.select) select = JSON.parse(req.query.select);

	var count = "false";
	if (req.query.count) count = JSON.parse(req.query.count);

	var done = User.find(where, select).sort(sort).skip(req.query.skip).limit(req.query.limit);
	if (count === "true")
		done = done.count();

	done.exec(function(err, users){
		if (err){
			//res.statusCode = 500;
			res.status(500).send({message : "The server had an error!", data: err});
		}
		else{
			//res.statusCode = 200;
			res.status(200).json({message: "OK", data: users});
		}
	});
});
userRoute.post(function(req, res,next){
	User.create(req.body, function(err, post){
		if (err){
			if (err.name === 'ValidationError'){
				//res.statusCode = 400;
				res.status(400).json({message: "Did you enter a name and email for this user?", data: err});
				//potential add error for duplicate email?
					//if so console.log the error and go through its properties
			}
			else{
				//res.statusCode = 500;
				res.status(500).json({message: "The server had an error.", data: err});
			}
		}
		else{
			//res.statusCode = 201;
			res.status(201).json({message: "User Created", data: post});
		}
	});
});
userRoute.options(function(req, res){
	//res.writeHead(200);
	//res.statusCode = 200;
	res.status(200).end();
});
//Single User Route Get put delete
singleUserRoute.get(function(req, res){
	User.findById(req.params.id, function(err, post){
		if (!post){ //user not found
			//res.statusCode = 404;
			res.status(404).send({message : "The user you were looking for does not exist.", data: post});
		}
		else if (err){
			//res.statusCode = 500;
			res.status(500).send({message: "The server encountered an error.", data: err});
		}
		else{
			//res.statusCode = 200;
			res.status(200).json({message: "OK", data: post});
		}
	});
});
singleUserRoute.put(function(req, res){
	User.findByIdAndUpdate(req.params.id, req.body, function(err, post){
		if (!post){
			//res.statusCode = 404;
			res.status(404).send({message : "The user you were looking for does not exist.", data: post});
		}
		else if (err){
			if (err.name === 'ValidationError'){
				//res.statusCode = 400;
				res.status(400).send({message : "Does your update include a name and email for the user?", data: post});
			}
			else{
				//res.statusCode = 500;
				res.status(500).send({message: "The server encountered an error.", data: err});
			}
		}
		else{
			//res.statusCode = 200;
		 	res.status(200).json({message: "User Updated", data: post});
		}
	});
});
singleUserRoute.delete(function(req, res){
	User.findByIdAndRemove(req.params.id, req.body, function(err, post){
		if (!post){
			//res.statusCode = 404;
			res.status(404).json({message: "User not found", data: post});
		}
		if (err){
			//res.statusCode = 500;
			res.status(500).json({message : "The server encountered an error.", data: err});
		}
		else {
			//res.statusCode = 200;
			res.status(200).json({message : "User Deleted", data : post});
		}
	});
});
//Tasks get post options
taskRoute.get(function(req, res){
	Task.find(function(err, tasks){
		
		var where = null;
		if (req.query.where) where = JSON.parse(req.query.where);
		var sort = null;
		if (req.query.sort) sort = JSON.parse(req.query.sort);
		var select = null;
		if (req.query.select) select = JSON.parse(req.query.select);

		var count = "false";
		if (req.query.count) count = JSON.parse(req.query.count);

		var done = Task.find(where, select).sort(sort).skip(req.query.skip).limit(req.query.limit);
		if (count === "true")
			done = done.count();

		done.exec(function(err, tasks){
			if (err){
				//res.statusCode = 500;
				res.status(500).send({message : "The server had an error!", data: err});
			}
			else{
				//res.statusCode = 200;
				res.status(200).json({message: "OK", data: tasks});
			}
		});

	});
});
taskRoute.post(function(req, res){
	Task.create(req.body, function(err,post){
		if (err){
				if (err.name === 'ValidationError'){
					//res.statusCode = 400;
					res.status(400).json({message: "Did you enter a name and deadline for this task?", data: err});
					//potential add error for duplicate email?
						//if so console.log the error and go through its properties
				}
				else{
					//res.statusCode = 500;
					res.status(500).json({message: "The server had an error.", data: err})
				}
			}
			else{
				//res.statusCode = 201;
				res.status(201).json({message: "Task Created", data: post});
			}
		});
});
taskRoute.options(function(req, res){
	//res.writeHead(200);
	//res.statusCode = 200;
	res.status(200).end();
});
//single task get put delete
singleTaskRoute.get(function(req,res){
	Task.findById(req.params.id, function(err, post){
		if (!post){ //user not found
			//res.statusCode = 404;
			res.status(404).send({message : "The task you were looking for does not exist.", data: post});
		}
		else if (err){
			//res.statusCode = 500;
			res.status(500).send({message: "The server encountered an error.", data: err});
		}
		else{
			//res.statusCode = 200;
			res.status(200).json({message: "OK", data: post});
		}
	});
});
singleTaskRoute.put(function(req, res){
	Task.findByIdAndUpdate(req.params.id, req.body, function(err, post){
		if (!post){
		//	res.statusCode = 404;
			res.status(404).send({message : "The task you were looking for does not exist.", data: post});
		}
		else if (err){
			if (err.name === 'ValidationError'){
			//	res.statusCode = 400;
				res.status(400).send({message : "Does your update include a name and deadline for the task?", data: post});
			}
			else{
				//res.statusCode = 500;
				res.status(500).send({message: "The server encountered an error.", data: err});
			}
		}
		else{
			//res.statusCode = 200;
		 	res.status(200).json({message: "Task Updated", data: post});
		}
	});
});
singleTaskRoute.delete(function(req, res){
	Task.findByIdAndRemove(req.params.id, req.body, function(err, post){
		if (!post){
			//res.statusCode = 404;
			res.status(404).json({message: "Task not found", data: post});
		}
		if (err){
			//res.statusCode = 500;
			res.status(500).json({message : "The server encountered an error.", data: err});
		}
		else {
		//	res.statusCode = 200;
			res.status(200).json({message : "Task Deleted", data : post});
		}
	});
});
// Start the server
app.listen(port);
console.log('Server running on port ' + port); 
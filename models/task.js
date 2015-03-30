var mongoose = require("mongoose");


var TaskSchema = new mongoose.Schema({
	name: {type: String, required: true},
	description: String,
	deadline: {type: Date, required: true},
	completed: Boolean,
	assignedUser:  {type: String, default : ""},					//DOUBT how to reference users
	assignedUserName: {type: String, default : "unassigned"}, 
	dateCreated: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Task', TaskSchema, 'tasks');
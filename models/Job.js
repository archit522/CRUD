const mongoose = require('mongoose');

//Defining Schema of Jobs table in MongoDB with result, status and date
const JobSchema = mongoose.Schema({
	result: {
		type: String,
		default: ""
	},
	status: {
		type: String,
		default: "pending"
	},
	Date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Jobs', JobSchema);

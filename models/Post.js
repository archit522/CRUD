const mongoose = require('mongoose');

//Defining Schema of Posts table in MongoDB with title, description and date
const PostSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Posts', PostSchema);

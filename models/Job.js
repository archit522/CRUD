const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Job = require('../models/Job');
const Post = require('../models/Post');

var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

//GET BACK ALL THE JOBS
router.get('/', async(req, res) =>{
	try{
		const jobs = await Job.find();
		res.json(jobs);
	}catch(err){
		res.json({message: err});
	}
});

//New Post
router.post('/new', async (req, res) =>{
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	const post = new Post({
		title: req.body.title,
		description: req.body.description
	});
	try{
		const savedJob = await job.save();
		const savedPost = post.save( async (err, doc)=>{
			if(err){
				res.json({message: err});
			}
			else{
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: JSON.stringify(doc)}},
				{returnOriginal: false}
					);
				res.json(updatejob);
			}
		});
		res.json(savedJob);

	}catch(err){
		res.json({message: err});
	}
});

//SPECIFIC POST
router.get('/find/:postId', async(req, res) => {
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	try{
		const savedJob = await job.save();
		console.log(req.params.postId);
		redis.get(req.params.postId, async (err, reply) =>{
			if(err){
				res.json({message: err});
			}
			else if(reply){
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: reply}},
				{returnOriginal: false}
					);
				console.log(reply);
				// res.json(updatejob);
			}
			else{
				const post = await Post.findById(req.params.postId);
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: JSON.stringify(post)}},
				{returnOriginal: false}
					);
				redis.set(req.params.postId, JSON.stringify(post));
				redis.expire(req.params.postId, 3000);
				// res.json(post);
			}
		});
		res.json(a);
	}catch(err){
		res.json({message: err});
	}
})

//DELETE A SPECIFIC POST
router.delete('/delete/:postId', async(req, res) =>{
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	try{
		const savedJob = await job.save();
		const removedPost = Post.remove({_id: req.params.postId}, async (err, reply)=>{
			if(err){
				res.json({message: err});
			}
			else{
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: "Deleted"}},
				{returnOriginal: false}
					);
				// res.json(updatejob);
				redis.del(req.params.postId, function(err, reply){
					console.log(reply);
				});
			}
		});
		res.json(a);
	}catch(err){
		res.json({message: err});
	}
});

//UPDATE A SPECIFIC POST
router.patch('/update/:postId', async(req, res)=>{
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	try{
		const savedJob = await job.save();
		const updatepost = Post.findOneAndUpdate(
			{_id: req.params.postId},
			{$set: {title: req.body.title}},
			{new: true}, async (err, doc) =>{
				if(err){
					res.json({message: err});
				}
				else if(!doc){
					console.log("Missing doc");
				}
				else{
					const updatejob = await Job.findOneAndUpdate(
					{_id: a},
					{$set: {status: "Done", result: JSON.stringify(doc)}},
					{returnOriginal: false}
						);
					redis.set(req.params.postId, JSON.stringify(doc));
					redis.expire(req.params.postId, 3000);
					// res.json(doc);
				}
			});
		res.json(a);
	}catch(err){
		res.json({message: err});
	}
})

router.get('/:jobId', async(req, res) =>{
	try{
		const job = await Job.findById(req.params.jobId);
		if(job.status == "Done"){
			res.json(job.result);
		}
		else{
			res.json(job.status);
		}
	}catch(err){
		res.json({message: err});
	}
});

module.exports = router;

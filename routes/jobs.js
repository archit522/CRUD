const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

//Importing Job and Post schema
const Job = require('../models/Job');
const Post = require('../models/Post');

//Using Redis client to setup connection to local redis server cache
var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

//URL to get back all the jobs as present in MongoDB
router.get('/', async(req, res) =>{
	try{
		const jobs = await Job.find();
		res.json(jobs);
	}catch(err){
		res.json({message: err});
	}
});

//URL to create a new post
router.post('/new', async (req, res) =>{
	//Generating a random ObjectId to assign to the new job created
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	const post = new Post({
		title: req.body.title,
		description: req.body.description
	});
	try{
		//Waiting for new job to be created in MongoDB
		const savedJob = await job.save();
		//Let post creation to be run in async mode
		const savedPost = post.save( async (err, doc)=>{
			if(err){
				res.json({message: err});
			}
			else{
				//Updating job status once post is created
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

//URL to find a post with the given postId
router.post('/find/:postId', async(req, res) => {
	//Generating a random ObjectId to assign to the new job created
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	try{
		//Waiting for new job to be created in MongoDB
		const savedJob = await job.save();
		//Looking for post present in cache
		redis.get(req.params.postId, async (err, reply) =>{
			if(err){
				res.json({message: err});
			}
			else if(reply){
				//Updating job status and result once post is found in cache
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: reply}},
				{returnOriginal: false}
					);
			}
			else{
				//Looking for post in MongoDB if it is not present in cache
				const post = await Post.findById(req.params.postId);
				//Updating job status and result once post is found in MongoDB
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: JSON.stringify(post)}},
				{returnOriginal: false}
					);
				//Insering post into cache with a 3000 TTL set
				redis.set(req.params.postId, JSON.stringify(post));
				redis.expire(req.params.postId, 3000);
			}
		});
		res.json(a);
	}catch(err){
		res.json({message: err});
	}
})

//URL to delete a specific post with the given post Id
router.post('/delete/:postId', async(req, res) =>{
	//Generating a random ObjectId to assign to the new job created
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	try{
		//Waiting for new job to be created in MongoDB
		const savedJob = await job.save();
		//Removing post from MongoDB 
		const removedPost = Post.remove({_id: req.params.postId}, async (err, reply)=>{
			if(err){
				res.json({message: err});
			}
			else{
				//Updating job once post has been removed
				const updatejob = await Job.findOneAndUpdate(
				{_id: a},
				{$set: {status: "Done", result: "Deleted"}},
				{returnOriginal: false}
					);
				//Deleting post from redis cache
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

//URL to update a specific post with the given postId
router.post('/update/:postId', async(req, res)=>{
	//Generating a random ObjectId to assign to the new job created
	var a = new mongoose.mongo.ObjectId();
	const job = new Job({
		_id: a
	});
	try{
		//Waiting for new job to be created in MongoDB
		const savedJob = await job.save();
		//Update post in the MongoDB
		const updatepost = Post.findOneAndUpdate(
			{_id: req.params.postId},
			{$set: {title: req.body.title}},
			{new: true}, async (err, doc) =>{
				if(err){
					res.json({message: err});
				}
				else if(!doc){
					res.json({message: "Internal error occured"});
				}
				else{
					//
					const updatejob = await Job.findOneAndUpdate(
					{_id: a},
					{$set: {status: "Done", result: JSON.stringify(doc)}},
					{returnOriginal: false}
						);
					redis.set(req.params.postId, JSON.stringify(doc));
					redis.expire(req.params.postId, 3000);
				}
			});
		res.json(a);
	}catch(err){
		res.json({message: err});
	}
})

//URL to return Job of given jobId
router.get('/:jobId', async(req, res) =>{
	try{
		//Find job in MongoDB
		const job = await Job.findById(req.params.jobId);
		if(job.status == "Done"){
			//Show result if job is done
			res.json(job.result);
		}
		else{
			//Show status if job is pending
			res.json(job.status);
		}
	}catch(err){
		//Report error if try fails
		res.json({message: err});
	}
});

module.exports = router;

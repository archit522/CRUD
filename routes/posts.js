const express = require('express');

const router = express.Router();

const Post = require('../models/Post');

var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

//Request to list all posts in MongoDB
router.get('/', async (req, res) =>{
	try{
		const posts = await Post.find();
		res.status(200);
		res.json(posts);
	}catch(err){
		res.status(500);
		res.json({message: err});
	}
});

//Request to create a new post in MongoDB 
router.post('/', async (req, res) =>{
	const post = new Post({
		title: req.body.title,
		description: req.body.description
	});

	try{
		const savedPost = await post.save();
		res.status(200);
		res.json(savedPost);
	} catch(err){
		res.status(500);
		res.json({message: err});
	}
});

//URL to get back a specific post with the given postId
router.get('/:postId', async (req, res) =>{
	try {
		//First checks for a hit in the redis cache
		redis.get(req.params.postId, async (err, reply) =>{
			if(err){
				console.log(err);
				res.status(500);
				res.json({message: err});
			}
			else if(reply){
				console.log(reply);
				res.status(200);
				res.json(reply);
			}
			else{
				//If there is a miss, check in the MongoDB and update cache accordingly
				const post = await Post.findById(req.params.postId);
				redis.set(req.params.postId, JSON.stringify(post));
				redis.expire(req.params.postId, 3000);
				res.status(200);
				res.json(post);
			}
		})
	}catch(err){
		res.status(500);
		res.json({message: err});
	}
});

//URL to delete a specific post with the given postId
router.delete('/:postId', async (req, res) =>{
	try {
		//Delete post from MongoDB as well as redis cache if present
		const removedPost = await Post.remove({_id: req.params.postId});
		redis.del(req.params.postId, function(err, reply){
			console.log(reply);
		});
		res.status(200);
		res.json(removedPost);
	}catch(err){
		res.status(500);
		res.json({message: err});
	}
});

//URL to update a specific post's title as given in postId
router.patch('/:postId', async (req, res) =>{
	try {
		//Update post title in MongoDB
		const updatepost = await Post.findOneAndUpdate(
			{_id: req.params.postId},
			{$set: {title: req.body.title}},
			{new: true}, function(err, doc){
				if(err){
					res.status(500);
					res.json({message: err});
				}
				else if(!doc){
					res.status(400);
					console.log("Missing doc");
				}
				else{
					//Update post title in redis cache as well
					redis.set(req.params.postId, JSON.stringify(doc));
					redis.expire(req.params.postId, 3000);
					res.status(200);
					res.json(doc);
				}
			}
			);
	}catch(err){
		res.status(500);
		res.json({message: err});
	}
})

module.exports = router;

const express = require('express');

const router = express.Router();

const Post = require('../models/Post');

var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

//GET BACK ALL POSTS
router.get('/', async (req, res) =>{
	try{
		const posts = await Post.find();
		res.json(posts);
	}catch(err){
		res.json({message: err});
	}
});

//SUBMIT A POST
router.post('/', async (req, res) =>{
	const post = new Post({
		title: req.body.title,
		description: req.body.description
	});

	try{
		const savedPost = await post.save();
		// redis.set(req.params.postId, JSON.stringify(savedPost));///////WRONG req.params.postId is not given
		// redis.expire(req.params.postId, 3000);
		res.json(savedPost);
	} catch(err){
		res.json({message: err});
	}
});

//SPECIFIC POST
router.get('/:postId', async (req, res) =>{
	try {
		redis.get(req.params.postId, async (err, reply) =>{
			if(err){
				console.log(err);
				res.json({message: err});
			}
			else if(reply){
				console.log(reply);
				res.json(reply);
			}
			else{
				const post = await Post.findById(req.params.postId);
				redis.set(req.params.postId, JSON.stringify(post));
				redis.expire(req.params.postId, 3000);
				res.json(post);
			}
		})
		// console.log(req.params.postId);
		// const post = await Post.findById(req.params.postId);
		// res.json(post);
	}catch(err){
		res.json({message: err});
	}
});

//DELETE POST
router.delete('/:postId', async (req, res) =>{
	try {
		const removedPost = await Post.remove({_id: req.params.postId});
		redis.del(req.params.postId, function(err, reply){
			console.log(reply);
		});
		res.json(removedPost);
	}catch(err){
		res.json({message: err});
	}
});

//UPDATE A POST
router.patch('/:postId', async (req, res) =>{
	try {
		const updatepost = await Post.findOneAndUpdate(
			{_id: req.params.postId},
			{$set: {title: req.body.title}},
			{new: true}, function(err, doc){
				if(err){
					res.json({message: err});
				}
				else if(!doc){
					console.log("Missing doc");
				}
				else{
					redis.set(req.params.postId, JSON.stringify(doc));
					redis.expire(req.params.postId, 3000);
					res.json(doc);
				}
			}
			);
	}catch(err){
		res.json({message: err});
	}
})

module.exports = router;
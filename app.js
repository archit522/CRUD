const express = require('express');

const app = express();

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

require('dotenv/config')
// //MIDDLEWARES
// app.use('/posts', () => {
// 	console.log('This is a middleware running');
// });

app.use(bodyParser.json());

//Import Routes
const postsRoute = require('./routes/posts');
const jobsRoute = require('./routes/jobs');
//ROUTES
app.get('/', (req, res) =>{
	res.send('We are on home');
});

app.use('/posts', postsRoute);
app.use('/jobs', jobsRoute);
//Connect to DB
mongoose.connect(process.env.DB_CONNECTION, 
	{ useNewUrlParser: true, useUnifiedTopology: true}, 
	() =>{
	console.log('connected to DB!')
});

redis.on("connect", () => {
    console.log('connected to Redis');
});

app.listen(3000);
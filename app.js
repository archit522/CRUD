const express = require('express');

const app = express();

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

//Using Redis client to setup connection to local redis server cache
var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');

//.env file contains database link URL
require('dotenv/config')

app.use(bodyParser.json());

//Importing Routes to handle API calls
const postsRoute = require('./routes/posts');
const jobsRoute = require('./routes/jobs');

//Defining Routes
app.get('/', (req, res) =>{
	res.send('We are on home');
});

app.use('/posts', postsRoute);
app.use('/jobs', jobsRoute);

//Check connection to MongoDB
mongoose.connect(process.env.DB_CONNECTION, 
	{ useNewUrlParser: true, useUnifiedTopology: true}, 
	() =>{
	console.log('connected to DB!')
});

//Check connection to Redis Cache
redis.on("connect", () => {
    console.log('connected to Redis');
});

app.listen(3000);

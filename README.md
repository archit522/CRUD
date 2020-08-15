# CRUD
Simple CRUD backend service with sync and async APIs
## Task-
#### Sync APIs: ####
1. Get: Search in the cache first and fallback to the DB in case of a cache miss.
2. Post: Update an entry
3. Put: Create an entry
4. Delete: Delete entry
#### Async APIs: ####
5. Submit: Submit an async job. Return a job_id.
6. Results: Get the results of a previously submitted job for a given job_id. If job is not complete
show its status pending

#### Tech Stack: ####
1. NodeJS
2. MongoDB
3. Redis Cache

## Proposed Solution-
Sync API is created with a NodeJS backend and connected to MongoDB and Redis Cache. The API can handle create (POST), read (GET), update (PATCH), delete (DELETE) requests for a post. The Post Schema in JSON is as below-
```
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
```
Async API is created with NodeJS backend and connected to MongoDB and Redis Cache. 
The API handles queries by creating a job for each task alloted. The tasks handled are create, read, update, delete of posts. 
Once the job is created, a jobId is returned and system completes the task asynchronously and updates the status of the job as well as stores the result. The job status and result can be accessed by a GET request to the API. The Job Schema in JSON is shown below-
```
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
```

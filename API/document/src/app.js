const express = require('express');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const logger = require('./configs/logger');
const { connectdb } = require('./configs/database');
const cors = require('cors');
const { initializeRedisClient } = require("./middleware/redis");
const { CustomError } = require('./middleware/customerror');
const status = require('http-status');

// connect to Redis
//(async () => { await initializeRedisClient(); })();


const port = process.env.PORT || 3000; 

// Connect to MongoDB
(async () => { await connectdb(); })();



app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});
 
 
const corsOptions = {
    origin: 'https://editor.swagger.io', // Allow requests from this origin
    //credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Use the CORS middleware with the defined options
app.use(cors(corsOptions));



app.use(express.json());  // Middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse incoming URL-encoded requests with extended options



// Importing the document router module and Mounting the document router at '/consumers' endpoint
const DocRouter = require('./route');

app.use('/api/v1/consumer',DocRouter);

app.use((req, res, next) => {
    next(new CustomError('Resource not found', status.NOT_FOUND))
})

app.use(errorHandler);   // Error handling middleware to handle and respond to errors

 
// Starting the Express server
const server = app.listen(port , () => { logger.info(`port running on http://localhost:${port}`)})

module.exports ={app,server}


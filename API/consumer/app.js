const mongoose = require('mongoose');
const express = require("express");
const app = express();
const  ErrorHandler = require('./middleware/errorHandler')
const logger = require('./logger')
const cors = require('cors');
const userRouter = require('./route/consumer_route')
const rsRouter = require('./route/RS_route')

require('dotenv').config();
 
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

(async function connectdb () {
    try{
        logger.info("Connecting to MongoDB...");
        await mongoose.connect(process.env.DBURL, { autoIndex: false });
        logger.info("connected successfully!!!"); 
    }
    catch(e){
        logger.error(`DBerror: ${e.message}`);
    }
})();

const word = { id: 1, movie : "VTV"}

app.get('/', (req,res) => {
    res.send(word);
})
 
const corsOptions = {
    origin: 'https://editor.swagger.io', // Allow requests from this origin
    //credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Use the CORS middleware with the defined options
app.use(cors(corsOptions));



app.use(express.json());

app.use('/api/v1/consumer',userRouter)
app.use('/api/v1/consumer',rsRouter)

app.use(ErrorHandler)

 

const server = app.listen(port , () => { logger.info(`port running on http://localhost:${port}`)})

module.exports = {app, server}
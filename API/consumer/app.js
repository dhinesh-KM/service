const mongoose = require('mongoose');
const express = require("express");
const app = express();
const  ErrorHandler = require('./middleware/errorHandler')
const logger = require('./logger')
const cors = require('cors');
const userRouter = require('./route/consumer_route')
const rsRouter = require('./route/RS_route')
const { CustomError } = require('./middleware/customerror');
const status = require('http-status')


require('dotenv').config();
 
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

let count = 0
const connectdb = async  () => {

    try{
        logger.info("Connecting to MongoDB...");
        await mongoose.connect(process.env.DBURL, { autoIndex: false });
        logger.info("connected successfully!!!"); 
    }
    catch(e){
        logger.error(`DBerror: ${e.message}`);
        if (count < 5)
        {
            count += 1
            setTimeout(connectdb(),5000)
            
            
        }
        
    }
};

connectdb()

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

app.use('*',(req, res, next) => {
    next(new CustomError('Resource not found', status.NOT_FOUND))
})

app.use(ErrorHandler)

 

const server = app.listen(port , () => { logger.info(`port running on http://localhost:${port}`)})

module.exports = {app, server}
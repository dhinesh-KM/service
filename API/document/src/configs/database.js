const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');


async function connectdb () {
    try{
        logger.info("Connecting to MongoDB...");
        await mongoose.connect(config.mongoURI, { autoIndex: false });
        logger.info("connected successfully!!!"); 
    }
    catch(e){
        logger.error(`DBerror: ${e.message}`);
    }
} 

module.exports = {connectdb};



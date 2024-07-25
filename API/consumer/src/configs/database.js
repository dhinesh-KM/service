const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');


let count = 0
const connectdb = async  () => {

    try{
        logger.info("Connecting to MongoDB...");
        await mongoose.connect(config.mongoURI, { autoIndex: false });
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

module.exports = connectdb
const logger = require('../configs/logger');
const status = require('http-status');
// Error handling middleware to handle error 
const ErrorHandler = (err,req,res,next) => {
    logger.info(`\n\n${err.stack}\n\n`)
    
    
    // To handle objectID error
    if(err.name == 'CastError')
        {
            const id = err.message.split(' ')[6].replace(/\"/g,'')
            res.status(status.BAD_REQUEST).json({ msg: `ID ${id} must be a 24-character hexadecimal string.` })
        }

    
    // To handle defined and undefined error
    res.status(err.statusCode || status.INTERNAL_SERVER_ERROR).json({ msg: err.message})
}

module.exports =  ErrorHandler;
const status = require('http-status')
const logger = require('../logger')

// Error handler middleware for error
const ErrorHandler = (err,req,res,next) => {
    //logger.info(`\n${err.stack}\n`)
    res.status(err.statusCode || status.INTERNAL_SERVER_ERROR).json({'msg': err.message})
}

module.exports =  ErrorHandler;
const {CustomError} = require('../middleware/customerror');

// Middleware function to handle payload validation against a schema
const validate_payload =  ( schema ) => {
    return (req, res, next) => {

        // Convert tags from string to JSON if it's a string
        if (typeof(req.body.tags) == 'string')
            req.body.tags = JSON.parse(req.body.tags)

        // Validate the request body against the schema
        const {value,error} = schema.validate(req.body, {abortEarly : false,  stripUnknown: true });
        
        if (error)
            throw new CustomError(error.message.replace(/"/g, ''), 400);
    
        // Set the validated payload (`value`) to `req.body` for further processing
        req.body = value;
        next();
    }
}

module.exports = {validate_payload};
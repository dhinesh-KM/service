// Define a custom error class extending the built-in Error class
class CustomError extends Error {
    
    // Constructor takes a message and a status code as parameters
    constructor(message,s_code){
        super(message);
        this.statusCode = s_code
        
    }
}

module.exports = {CustomError};
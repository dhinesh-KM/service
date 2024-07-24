// Define a CustomError class that extends the built-in Error class
class CustomError extends Error {
    /**
     * Create a new CustomError instance.
     * @param {string} message - The error message.
     * @param {number} s_code - The HTTP status code.
     */
    constructor(message, s_code) {
        super(message); // Call the parent Error class constructor with the message
        this.statusCode = s_code; // Add a statusCode property to the instance
    }
}

module.exports = CustomError;
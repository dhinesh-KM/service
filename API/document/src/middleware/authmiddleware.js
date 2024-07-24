const jwt = require('jsonwebtoken');
const config = require('../configs/config')
const {CustomError} = require('./customerror');
const status = require('http-status');


// verify the token and authorize the user to access the resource
async function authjwt(req,res,next) {
    const token = req.header('Authorization')

    if (!token)
        return next(new CustomError(status[status.UNAUTHORIZED],status.UNAUTHORIZED)) 

    try{

        const decoded = jwt.verify(token.split(" ")[1], config.jwtSecret);
        // Set the decoded 'value' to `req.user` for further processing
        req.user = decoded;
        next(); 
    }
    catch(err){
        if (err) {
            if (err.name == "JsonWebTokenError")
                return next(new CustomError("Invalid token",status.BAD_REQUEST)) 

            if (err.name == "TokenExpiredError")
                return next(new CustomError("Token Expired", status.BAD_REQUEST))

            return res.status(status.INTERNAL_SERVER_ERROR).json({'msg': err.message})
        }
    }
    
}

module.exports = authjwt;

/*
const coffer_id1 =  "56489f3ccba2c7dd"; //johndoe@example.com(email verified user)
const coffer_id2 = "d14ac03118d83200"; //1234567890(mobile verified user)
const token = jwt.sign({ coffer_id: coffer_id1}, process.env.SECRETKEY, {expiresIn : '1h'}  )*/
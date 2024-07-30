const jwt = require('jsonwebtoken');
const CustomError = require('./customerror');
const config = require('../configs/config')



function authjwt(req,res,next) {
    const token = req.header('Authorization')

    if (!token)
        return  next(new CustomError("Unauthorized",401)) 


    jwt.verify(token.split(" ")[1], config.secretKey, (err, decoded) => {
        
        if (err) {
            if (err.name == "JsonWebTokenError")
                return  next(new CustomError("Invalid token",400)) 

            if (err.name == "TokenExpiredError")
                return next(new CustomError("Token Expired", 400))

            return res.status(500).json({'msg': err.message})
        }
        req.user = decoded;
        next(); 
      })
    
}

module.exports = authjwt;
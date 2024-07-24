const jwt = require('jsonwebtoken');
require('dotenv').config();
const CustomError = require('./customerror');

const coffer_id1 =  "56489f3ccba2c7dd"; //johndoe@example.com(email verified user)
//const coffer_id2 = "6a4923bb2f62fd66"; //1234567890(mobile verified user)

function authjwt(req,res,next) {
    const token = req.header('Authorization')
    //const token = jwt.sign({ cofferid: coffer_id1}, process.env.SECRETKEY, {expiresIn : '1m'}  )

    if (!token)
        return  next(new CustomError("Unauthorised",401)) 


    jwt.verify(token.split(" ")[1], process.env.SECRETKEY, (err, decoded) => {
    //jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
        
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
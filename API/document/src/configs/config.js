require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI_ATLAS,
  jwtSecret: process.env.SECRETKEY,
  domain: process.env.DOMAIN,
  redisURI: process.env.REDIS_URI
};
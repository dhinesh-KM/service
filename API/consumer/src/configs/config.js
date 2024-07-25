require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.DBURL,
  secretKey: process.env.SECRETKEY,
  domain: process.env.HOST,
  redisURI: process.env.REDIS_URI
};
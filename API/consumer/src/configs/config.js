require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.DBURL,
  secretKey: process.env.SECRETKEY,
  domain: process.env.DOC_DOMAIN,
  redisURI: process.env.REDIS_URI
};
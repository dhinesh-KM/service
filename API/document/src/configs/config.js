const dotenv = require('dotenv')
const path = require('path')

// Determine the environment and load the appropriate .env file
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${env}`})

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI_ATLAS,
  jwtSecret: process.env.SECRETKEY,
  domain: process.env.DOMAIN,
  redisURI: process.env.REDIS_URI
}
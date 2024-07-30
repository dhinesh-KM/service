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
  redisURI: process.env.REDIS_URI,
  /*projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.PRIVATE_KEY,
  type: process.env.TYPE,
  project_key_Id: process.env.PRIVATE_KEY_id,
  client_Id: process.env.CLIENT_ID,
  auth_Uri: process.env.AUTH_URI,
  TOKEN_URI: process.env.TOKEN_URI,
  AUTH_PROVIDER_X509_CERT_URL: process.env.AUTH_PROVIDER_X509_CERT_URL,
  CLIENT_X509_CERT_URL: process.env.CLIENT_X509_CERT_URL,
  UNIVERSE_DOMAIN: process.env.UNIVERSE_DOMAIN,*/
}
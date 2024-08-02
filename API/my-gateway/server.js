const path = require('path');
const gateway = require('express-gateway');
const dotenv = require('dotenv')


const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${env}`})

gateway()
  .load(path.join(__dirname, 'config'))
  .run();

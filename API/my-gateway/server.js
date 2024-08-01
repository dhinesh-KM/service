const path = require('path');
const gateway = require('express-gateway');

console.log("******",process.env.NODE_ENV,process.env.DOCUMENT_HOST, process.env.CONSUMER_HOST,process.env.CONSUMER_SERVICE_URL)
gateway()
  .load(path.join(__dirname, 'config'))
  .run();

const express = require('express');
const router = express.Router();
const authjwt = require('./middleware/authmiddleware');
const {IsUser, con_citizenships} = require('./middleware/permission');
const control = require('./controller/document_controller');
const { validate_payload } = require('./validation/validator');
const { personalDocument_Post, personalDocument_Update } = require('./validation/schema');
const multer = require('multer');
const {  redisCacheMiddleware } = require('./middleware/redis');

// Initialize Multer with memory storage configuration and  Files will be stored in memory as Buffer objects 
const upload = multer({storage: multer.memoryStorage()})

router.use(authjwt)


// Personal Documents of Citizenship
router.get('/personal/:cat',   redisCacheMiddleware(), con_citizenships, control.getCitzDocuments );
router.get('/personal/tagged/:cat/:tag',redisCacheMiddleware(), con_citizenships, control.getTagDocuments);
router.get('/personal/counts/:cat', redisCacheMiddleware(), con_citizenships, control.getTagsCount);

// Personal document operations 
router.post('/personal/:cat/add',  con_citizenships, upload.single('file'), validate_payload(personalDocument_Post), control.postDocument); 
router.patch('/personal/:cat/:id/update',  IsUser, con_citizenships, validate_payload(personalDocument_Update), control.updateDocument); 
router.delete('/personal/:cat/:id/delete', IsUser, con_citizenships, control.deleteDocument); 
router.get('/personal/:cat/:id/download', IsUser, redisCacheMiddleware({EX:3540}),  con_citizenships, control.downloadDocument); 
router.get('/personal/:cat/:id/view', IsUser, redisCacheMiddleware({EX:3540}), con_citizenships, control.viewDocument); 
router.get('/personal/:cat/:id/details', IsUser, redisCacheMiddleware(), con_citizenships, control.documentDetails); 

router.post('/p-docs', control.get_pdocs);
router.get('/p-docs/details', control.get_pdocsDetails)


 

 
module.exports = router;


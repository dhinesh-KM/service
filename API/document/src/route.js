const express = require('express');
const router = express.Router();
const authjwt = require('./middleware/authmiddleware');
const {IsUser, con_citizenships} = require('./middleware/permission');
const control = require('./controller/document_controller');
const { validate_payload } = require('./validation/validator');
const { personalDocument_Post, personalDocument_Update, missingIds } = require('./validation/schema');
const multer = require('multer');
const {  redisCacheMiddleware } = require('./middleware/redis');

// Initialize Multer with memory storage configuration and  Files will be stored in memory as Buffer objects 
const upload = multer({storage: multer.memoryStorage()})

router.use(authjwt)

if (process.env.NODE_ENV == 'dev')
    {
        // Personal Documents of Citizenship
        router.get('/personal/:cat',   redisCacheMiddleware({EX:3600}), con_citizenships, control.getCitzDocuments );
        router.get('/personal/tagged/:cat/:tag',redisCacheMiddleware({EX:3600}), con_citizenships, control.getTagDocuments);
        router.get('/personal/counts/:cat', redisCacheMiddleware({EX:3600}), con_citizenships, control.getTagsCount);

        // Personal document operations 
        router.post('/personal/:cat/add',  con_citizenships, upload.single('file'), validate_payload(personalDocument_Post), control.postDocument); 
        router.patch('/personal/:cat/:id/update',  IsUser, con_citizenships, validate_payload(personalDocument_Update), control.updateDocument); 
        router.delete('/personal/:cat/:id/delete', IsUser, con_citizenships, control.deleteDocument); 
        router.get('/personal/:cat/:id/download', IsUser, redisCacheMiddleware({EX:3540}),  con_citizenships, control.downloadDocument); 
        router.get('/personal/:cat/:id/view', IsUser, redisCacheMiddleware({EX:3540}), con_citizenships, control.viewDocument); 
        router.get('/personal/:cat/:id/details', IsUser, redisCacheMiddleware({EX:3600}), con_citizenships, control.documentDetails); 

        router.post('/p-docs', validate_payload(missingIds), control.get_pdocs);
        router.post('/p-docs/details', control.get_pdocsDetails)
        router.get('/p-docs/:action/:id', IsUser, control.action)
    }


// Personal Documents of Citizenship
router.get('/personal/:cat',    con_citizenships, control.getCitzDocuments );
router.get('/personal/tagged/:cat/:tag', con_citizenships, control.getTagDocuments);
router.get('/personal/counts/:cat',  con_citizenships, control.getTagsCount);

// Personal document operations 
router.post('/personal/:cat/add',  con_citizenships, upload.single('file'), validate_payload(personalDocument_Post), control.postDocument); 
router.patch('/personal/:cat/:id/update',  IsUser, con_citizenships, validate_payload(personalDocument_Update), control.updateDocument); 
router.delete('/personal/:cat/:id/delete', IsUser, con_citizenships, control.deleteDocument); 
router.get('/personal/:cat/:id/download', IsUser,   con_citizenships, control.downloadDocument); 
router.get('/personal/:cat/:id/view', IsUser,  con_citizenships, control.viewDocument); 
router.get('/personal/:cat/:id/details', IsUser,  con_citizenships, control.documentDetails); 

router.post('/p-docs', validate_payload(missingIds), control.get_pdocs);
router.post('/p-docs/details', control.get_pdocsDetails)
router.get('/p-docs/:action/:id', IsUser, control.action)


 

 
module.exports = router;


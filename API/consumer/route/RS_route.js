const express = require('express')
const router = express.Router()
const control = require('../controller/RS_controller')
const {validate_payload} = require('../validation/validator')
const {relshipRequestSchema, relshipAcceptSchema} = require('../validation/schema')
const authjwt = require('../middleware/authmiddleware')
const IsUser = require('../middleware/permission')
const { valid } = require('joi')


router.use(authjwt)

router.get('/sprelationship/search/consumer',  control.getAllUser)
router.post('/sprelationship/request/consumer', validate_payload(relshipRequestSchema), control.create_SprRelShipReq)
router.post('/sprelationship/:relid/accept', validate_payload(relshipAcceptSchema), control.create_SprRelShipAcp)
router.get('/relationships', control.getAllRelationships)
router.get('/relationships/bytag/:tag', control.getRelationships_ByTag)
router.get('/relationships/tagcount', control.getRelationships_TagCount)

module.exports = router 
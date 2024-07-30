const express = require("express")
const router = express.Router()
const control = require("../controller/RS_controller")
const { validate_payload } = require("../validation/validator")
const { relshipRequestSchema, relshipAcceptSchema, docShareSchema, docUnshareSchema, relshipRejectSchema } = require("../validation/schema")
const authjwt = require("../middleware/authmiddleware")
const { docDetails, mis_Ids, action,  } = require("../middleware/service_comm")

router.use(authjwt)

router.get("/sprelationship/search/consumer", control.getAllUser)
router.post("/sprelationship/request/consumer", validate_payload(relshipRequestSchema), control.create_SprRelShipReq)
router.post("/sprelationship/:relid/accept", validate_payload(relshipAcceptSchema), control.create_SprRelShipAcp)
router.post("/sprelationship/:relid/reject", validate_payload(relshipRejectSchema), control.create_SprRelShipAcp)
router.get("/relationships", control.getAllRelationships)
router.get("/relationships/bytag/:tag", control.getRelationships_ByTag)
router.get("/relationships/tagcount", control.getRelationships_TagCount)
router.post("/relationships/:rel_id/docs/share",validate_payload(docShareSchema), mis_Ids, control.relationshipDocs_Share)
router.post("/relationships/:rel_id/docs/unshare",validate_payload(docUnshareSchema), mis_Ids, control.relationshipDocs_Share)
router.get("/relationships/:rel_id/docs/shared/byme", docDetails, control.docs_SharedByMe)
router.get("/relationships/:rel_id/docs/shared/withme", docDetails, control.docs_SharedByMe)
router.get("/relationships/:rel_id/:docid/:action", action, control.docs_Action )


module.exports = router

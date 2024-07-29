const db = require("../dboperations/relationship");
const controller = require("../controller/generic_controller");

const getAllUser = controller.get(db.getConsumer);

const create_SprRelShipReq = controller.post(db.sprelationship_Request_Consumer);

const create_SprRelShipAcp = controller.post(db.sprelationship_Accept_Consumer);

const getAllRelationships = controller.get(db.getRelationships);

const getRelationships_TagCount = controller.get(db.sprelationship_TagCount);

const getRelationships_ByTag = controller.get(db.getRelationships);

const relationshipDocs_Share = controller.post(db.shareDocs);

const relationshipDocs_Unshare = controller.post(db.shareDocs);

const docs_SharedByMe = controller.get(db.share);


module.exports = {
    getAllUser,
    create_SprRelShipReq,
    getAllRelationships,
    getRelationships_TagCount,
    getRelationships_ByTag,
    create_SprRelShipAcp,
    relationshipDocs_Share,
    docs_SharedByMe,
    relationshipDocs_Unshare
};

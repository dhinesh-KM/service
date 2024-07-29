const {get, post, patch, Delete, retrive} = require('./generic_controller');
const db = require('../dboperations');

// Middleware functions to handle Personal document operations

const getCitzDocuments = get((params) => db.personalDoc_Operations({...params, action : 'citz_docs'}));

const getTagsCount = get((params) => db.personalDoc_Operations({...params, action : 'tags_count'}));
 
const getTagDocuments = get((params) => db.personalDoc_Operations({...params, action : 'tag_docs'}));

const postDocument = post((params,data) => db.personalDoc_Operations({...params, action : 'create'},data));

const updateDocument = patch((params,data) => db.personalDoc_Operations({...params, action : 'update'},data));

const downloadDocument = get((params) => db.personalDoc_Operations({...params, action : 'download'}));

const deleteDocument = Delete((params) => db.personalDoc_Operations({...params, action : 'delete'}));

const viewDocument = get((params) => db.personalDoc_Operations({...params, action : 'view'}));

const documentDetails = get((params) => db.personalDoc_Operations({...params, action : 'details'}));

const post_Idocument = post((params,data) => db.identityDoc_Operations({...params, action : 'create'},data));

const get_pdocs = retrive(db.getAllDocs)

const get_pdocsDetails = retrive(db.getAllDocsDetails)

const action = retrive(db.action)



module.exports = {getCitzDocuments, getTagsCount, getTagDocuments, postDocument, updateDocument, downloadDocument, 
    deleteDocument, viewDocument, documentDetails, post_Idocument, get_pdocs, get_pdocsDetails, action}
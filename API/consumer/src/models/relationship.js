const mongoose = require('mongoose');

const specialRelationshipSchema = new mongoose.Schema({

    requestor_type : {type: String },
    requestor_uid : {type: String },
    acceptor_type : {type: String },
    acceptor_uid : {type: String },
    created : { type: Date }, 
    accepted_date : { type: Date },
    isaccepted : { type: Boolean, default: false},
    description : {type: String },
    status : {type: String },
    reject_reason : {type: String },
    requestor_group_acls : { type: [String]},
    acceptor_group_acls : { type: [String]},
    tcfilename : {type: String },
    requestor_tags : { type: [String],  default: [] },
    acceptor_tags : { type: [String],  default: [] }
    //requestor = GenericLazyReferenceField()
    //acceptor = GenericLazyReferenceField()

})

const sharedDocumentSchema = new mongoose.Schema({
    relationship_id : {type: String },
    relationship_type : {type: String },
    shared_with : {type: String },
    shared_by : {type: String },
    docid : {type: String },
    doctype : {type: String },
    docversion : {type: String }
    //    docref = GenericLazyReferenceField()
    //    b2brelationship = ReferenceField(B2BRelationship)
    //    relationship = ReferenceField(Relationship)



})

const SpecialRelationship = mongoose.model('SpecialRelationship', specialRelationshipSchema, 'Special Relationships')

const SharedDocument = mongoose.model('SharedDocument', sharedDocumentSchema, 'Shared Documents')

module.exports = {SpecialRelationship, SharedDocument}

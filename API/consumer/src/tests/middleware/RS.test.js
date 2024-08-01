const httpMocks = require('node-mocks-http')
//const CustomError = require('../../middleware/customerror')
const axios = require('axios')
const mongoose = require('mongoose')
const config = require("../../configs/config")
const {mis_Ids, docDetails} = require('../../middleware/service_comm')
const { SpecialRelationship, SharedDocument } = require("../../models/relationship")



jest.mock('axios')
jest.mock('../../configs/config', () => ({
    domain: 'http://127.0.0.1:6000'
}))
jest.mock('../../models/relationship')

describe( "mis_Ids middleware", () => {
    let req,res,next
    const docid1 = new mongoose.Types.ObjectId().toString()
    const docid2 = new mongoose.Types.ObjectId().toString()
    const docid3 = new mongoose.Types.ObjectId().toString()

    beforeEach( () => {
        req = httpMocks.createRequest()
        res = httpMocks.createResponse()
        next = jest.fn()
    })

    it( "should get missing ids and existing doc names using req body add from doc share and unshare payload:", async () => {
        req.header = jest.fn().mockReturnValue(`Bearer token`);
        req.body.add =  [ 
            { doctype: "personal", docid: docid1},
            { doctype: "personal", docid: docid2},
            { doctype: "identity", docid: docid3}
             ]

        const resp1 = {data : { data:  {docname: [ "personal" ],missingIds: [docid2]}}}
        const resp2 = {data : { data:  {docname: [ "identity" ],missingIds: []}}}

        axios.post.mockResolvedValueOnce(resp1)//.mockResolvedValueOnce(resp2)

        await mis_Ids(req,res,next)

        expect(axios.post).toHaveBeenCalledWith( `${config.domain}/api/v1/consumer/p-docs`, { docid: [docid1,docid2] },
            { headers: { Authorization: "Bearer token" } })
        expect(req.body.docs).toEqual({ personal: { docname: ['personal'], missingIds: [docid2]}})//, identity: { docname: ['identity'], missingIds: []}  })
        expect(next).toHaveBeenCalled()
        
    })
})

describe( "doc_details mddleware", () => {
    let req,res,next
    const docid1 = new mongoose.Types.ObjectId().toString()
    const docid2 = new mongoose.Types.ObjectId().toString()
    const sprid = new mongoose.Types.ObjectId().toString()
    const rel_id = new mongoose.Types.ObjectId().toString()
    const coffer_id1 = new mongoose.Types.ObjectId().toString()
    const coffer_id2 = new mongoose.Types.ObjectId().toString()
    const sd_id1 = new mongoose.Types.ObjectId().toString()
    const sd_id2 = new mongoose.Types.ObjectId().toString()
    const shr = [{
        _id: sd_id1,
        relationship_id: rel_id,
        relationship_type: "consumer to consumer",
        shared_with: coffer_id1,
        shared_by: coffer_id2,
        docid: docid1,
        doctype: "personal"
    },
    {
        _id: sd_id2, 
        relationship_id: rel_id,
        relationship_type: "consumer to consumer",
        shared_with: coffer_id2,
        shared_by: coffer_id1,
        docid: docid2,
        doctype: "personal",
      }
]
const shr_Data = [{
    docname : "others",
    description : "others desc",
    docid : docid1,
    category : "citizen_primary",
    doctype : "personal",
    country_affiliation : "citizen_primary",
    filename : "file1.jpg",
    url: "url",
    content_type : "image/jpeg",
    added_encryption : false
    },
    {
        docname: "Health",
        description: "prescribed medicine to improve immunity",
        docid: docid2,
        category: "citizen_primary",
        doctype: "personal",
        country_affiliation: "citizen_primary",
        filename: "file2.jpg",
        url: "url",
        content_type: "image/jpeg",
        added_encryption: false
                }]


    beforeEach( () => {
        req = httpMocks.createRequest()
        res = httpMocks.createResponse()
        next = jest.fn()
    })

    it( "shared by me;", async() => {
        req.url = 'docs/shared/byme'
        req.header = jest.fn().mockReturnValue(`Bearer token`);
        req.user = {coffer_id: coffer_id1}
        req.params = {rel_id: rel_id}
        const spr = {_id: sprid, requestor_uid : coffer_id1, acceptor_uid: coffer_id2, isaccepted: true}
        
        SpecialRelationship.findById.mockResolvedValue(spr)
        SharedDocument.find.mockResolvedValue([shr[1]])

        axios.post.mockResolvedValueOnce({data:{data: [shr_Data[1]]}})

        await docDetails(req,res,next)

        expect(axios.post).toHaveBeenCalledWith( `${config.domain}/api/v1/consumer/p-docs/details`, { docid: [docid2] },
            { headers: { Authorization: "Bearer token" } })
        expect(req.params.docs).toEqual([shr_Data[1]])

    })

    it( "shared with me;", async() => {
        req.url = 'docs/shared/withme'
        req.header = jest.fn().mockReturnValue(`Bearer token`);
        req.user = {coffer_id: coffer_id1}
        req.params = {rel_id: rel_id}
        const spr = {_id: sprid, requestor_uid : coffer_id1, acceptor_uid: coffer_id2, isaccepted: true}
        
        SpecialRelationship.findById.mockResolvedValue(spr)
        SharedDocument.find.mockResolvedValue([shr[0]])

        axios.post.mockResolvedValueOnce({data:{data: [shr_Data[0]]}})

        await docDetails(req,res,next)

        expect(axios.post).toHaveBeenCalledWith( `${config.domain}/api/v1/consumer/p-docs/details`, { docid: [docid1] },
            { headers: { Authorization: "Bearer token" } })
        expect(req.params.docs).toEqual([shr_Data[0]])

    })


})

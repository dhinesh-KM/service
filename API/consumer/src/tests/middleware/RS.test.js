const httpMocks = require('node-mocks-http')
//const CustomError = require('../../middleware/customerror')
const axios = require('axios')
const mongoose = require('mongoose')
const config = require("../../configs/config")
const {mis_Ids} = require('../../middleware/service_comm')
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

        //console.log(req.header,config.domain)
        const resp1 = {data : { data:  {docname: [ "personal" ],missingIds: [docid2]}}}
        const resp2 = {data : { data:  {docname: [ "identity" ],missingIds: []}}}

        axios.post.mockResolvedValueOnce(resp1).mockResolvedValueOnce(resp2)

        await mis_Ids(req,res,next)

        expect(axios.post).toHaveBeenCalledWith( `${config.domain}/api/v1/consumer/p-docs`, { docid: [docid1,docid2] },
            { headers: { Authorization: "Bearer token" } })
        expect(req.body.docs).toEqual({ personal: { docname: ['personal'], missingIds: [docid2]}, identity: { docname: ['identity'], missingIds: []}  })
        expect(next).toHaveBeenCalled()
        
    })
})

describe( "doc_details mddleware", () => {
    let req,res,next
    const docid1 = new mongoose.Types.ObjectId().toString()
    const sprid = new mongoose.Types.ObjectId().toString()
    const rel_id = new mongoose.Types.ObjectId().toString()
    const coffer_id1 = new mongoose.Types.ObjectId().toString()
    const coffer_id2 = new mongoose.Types.ObjectId().toString()

    beforeEach( () => {
        req = httpMocks.createRequest()
        res = httpMocks.createResponse()
        next = jest.fn()
    })

    describe( "", async() => {
        req.url = jest.fn().mockReturnValue('docs/shared/byme')
        req.header = jest.fn().mockReturnValue(`Bearer token`);
        req.user = {coffer_id: coffer_id1}
        req.params = {rel_id: rel_id}
        const spr = {_id: sprid, requestor_uid : coffer_id1, acceptor_uid: coffer_id2, isaccepted: true}
        const shr = [{}]
        SpecialRelationship.findById.mockResolvedValue(spr)
        SharedDocument.find.mockResolvedValue()

    })


})

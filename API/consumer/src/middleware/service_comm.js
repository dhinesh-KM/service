const { SpecialRelationship, SharedDocument } = require("../models/relationship")
const axios = require("axios")
const config = require("../configs/config")
const CustomError = require("./customerror")
const status = require("http-status")

// Fetches user personal docs data from document service using Axios.
async function mis_Ids(req, res, next) {
    try {
        const headers = { Authorization: `${req.header("Authorization")}` }

        //seperate the personal doc ids and identity doc ids to make payload for subsequest http request
        const docid = req.body.add.reduce(
            (obj, data) => {
                obj[data.doctype].push(data.docid)
                return obj
            },
            { identity: [], personal: [] }
        )

        console.log(docid)

        const personal_payload = { docid: docid.personal }
        const identity_payload = { docid: docid.identity }

        // Make an asynchronous POST request to the personal document  endpoint to get missing ids
        const personalResponse = await axios.post(`${config.domain}/api/v1/consumer/p-docs`,personal_payload,{ headers })
        console.log("=========", personalResponse.data)
        const ids = { personal: personalResponse.data.data } // identity: response[1].data.data}
        req.body.docs = ids
        next()
    } catch (err) {
        next(err)
    }
}



async function docDetails(req, res, next) {
    try {

        const url = req.url.split("/").pop()
        const headers = { Authorization: `${req.header("Authorization")}` }
        const cofferid = req.user.coffer_id
        let sharedBy

        const spr = await SpecialRelationship.findById(req.params.rel_id)
        if (spr == null)
            throw new CustomError("Relationship not found.", status.NOT_FOUND)
        if (url == "byme") 
            {
                console.log("11111111")
                if (cofferid == spr.requestor_uid)  sharedBy = spr.requestor_uid
                else if (cofferid == spr.acceptor_uid)  sharedBy = spr.acceptor_uid
            }
        if (url == 'withme')
            {
                console.log("2222222222")
                if (cofferid == spr.requestor_uid)  sharedBy = spr.acceptor_uid
                else if (cofferid == spr.acceptor_uid)  sharedBy = spr.requestor_uid
            }
        
        
        console.log(cofferid, sharedBy)
        let docs = await SharedDocument.find({ relationship_id: req.params.rel_id, shared_by: sharedBy})

        docs = docs.reduce(
            (obj, data) => {
                obj[data.doctype].push(data.docid)
                return obj
            },
            { personal: [], identity: [] }
        )

        console.log("000000", docs)

        const personal_payload = { docid: docs.personal }
        const identity_payload = { docid: docs.identity }

        console.log(personal_payload)
        // Make an asynchronous POST request to the personal document  endpoint to get missing ids
        const personalResponse = await axios.post(`${config.domain}/api/v1/consumer/p-docs/details`, personal_payload, { headers } )
        req.params.docs = [...personalResponse.data.data]
        next()
    } catch (err) {
        next(`Axios error: ${err}`)
    }
}

module.exports = { docDetails, mis_Ids }

const { SpecialRelationship, SharedDocument } = require("../models/relationship")
const axios = require("axios")
const config = require("../configs/config")
const CustomError = require("./customerror")
const status = require("http-status")
const { spr_ById } = require("../utils/findHelpers")



// Fetches user personal docs data from document service using Axios.
async function mis_Ids(req, res, next) {
    try {
        const headers = { Authorization: `${req.header("Authorization")}` }
        const body = req.body.add != undefined ? req.body.add : req.body.remove
        let personalResponse, identityResponse, ids = { }

        //seperate the personal doc ids and identity doc ids to make payload for subsequest http request
        const docid = body.reduce(
            (obj, data) => {
                obj[data.doctype].push(data.docid)
                return obj
            },
            { identity: [], personal: [] }
        )

        const personal_payload = { docid: docid.personal }
        const identity_payload = { docid: docid.identity }

        
        if (docid.personal.length != 0)
            {
                personalResponse = await axios.post(`${config.domain}/api/v1/consumer/p-docs`,personal_payload,{ headers })
                ids = {personal : personalResponse.data.data}
            }

        /*if (docid.identity.length != 0)
            {
                identityResponse = await axios.post(`${config.domain}/api/v1/consumer/i-docs`,identity_payload,{ headers })
                ids = {...ids, identity: identityResponse.data.data}
            }*/

        req.body.docs = ids
        next()
    } 
    catch (err) {
        next(err)
    }
}

/**
 * Middleware function to fetch document details from an personal document service.
 *
 * This function is responsible for:
 * 1. Fetching a specific relationship document based on the provided relationship ID (rel_id) from the request parameters.
 * 2. Verifying if the relationship exists and is accepted.
 * 3. Making an API call to personal document service to fetch document details based on the action and document ID (docid) from the request parameters.
 * 4. Storing the fetched document URL in the request parameters for subsequent middleware or route handlers.
 * 5. Handling any errors that occur during the process and passing them to the error handling middleware.
 *
 * @param {object} req - The Express request object, containing parameters, headers, etc.
 * @param {object} res - The Express response object (not used directly in this function).
 * @param {function} next - The next middleware function in the stack. It is called with an error if any step fails.
 */
async function docDetails(req, res, next) {
    try {
        const url = req.url.split("/").pop()
        const headers = { Authorization: `${req.header("Authorization")}` }

        const cofferid = req.user.coffer_id
        let sharedBy, personalResponse, identityResponse, data = []
        const spr = await spr_ById(req.params.rel_id)

        if (url == "byme") 
            {
                if (cofferid == spr.requestor_uid)  sharedBy = spr.requestor_uid
                else if (cofferid == spr.acceptor_uid)  sharedBy = spr.acceptor_uid
            }
        if (url == 'withme')
            {
                if (cofferid == spr.requestor_uid)  sharedBy = spr.acceptor_uid
                else if (cofferid == spr.acceptor_uid)  sharedBy = spr.requestor_uid
            }
        
        let docs = await SharedDocument.find({ relationship_id: req.params.rel_id, shared_by: sharedBy})
        docs = docs.reduce(
            (obj, data) => {
                obj[data.doctype].push(data.docid)
                return obj
            },
            { personal: [], identity: [] }
        )

        const personal_payload = { docid: docs.personal }
        const identity_payload = { docid: docs.identity }

        if (docs.personal.length != 0)
            {
                personalResponse = await axios.post(`${config.domain}/api/v1/consumer/p-docs/details`, personal_payload, { headers } )
                data = [...personalResponse.data.data]
            }
        
        if (docs.identity.length != 0)
            {
                identityResponse = await axios.post(`${config.domain}/api/v1/consumer/i-docs/details`, identity_payload, { headers } )
                data = [...data, ...identityResponse.data.data]
            }
        req.params.docs = data
        next()
    } 
    catch (err) {
        next(err)
    }
}

async function action(req, res, next)
{
    try{
        const spr = await spr_ById(req.params.rel_id)

        if (!spr.isaccepted)
            throw new CustomError('Relationship not accepted.', status.ACCEPTED)

        const headers = { Authorization: `${req.header("Authorization")}` }
        const resp = await axios.get(`${config.domain}/api/v1/consumer/p-docs/${req.params.action}/${req.params.docid}`,{headers})

        req.params.url = resp.data.url
        next()
    }
    catch(err){
        if (err.name == 'AxiosError')
            {
                const e = err.message.split(' ').pop()
                if (e == 401)
                    next(new CustomError('Unauthorized',status.UNAUTHORIZED))
                if (e == 404)
                    next(new CustomError(`Document with this id ${req.params.docid}  not found.`,status.NOT_FOUND)) 
                if (e == 400)
                    next(new CustomError(`Document ID ${req.params.docid} must be a 24-character hexadecimal string.`,status.BAD_REQUEST)) 
                if (e == 500)
                    next(new CustomError(`${err.message}`,status.INTERNAL_SERVER_ERROR ))
            }
        else
            {
                next(err)
            }
    }

}

module.exports = { docDetails, mis_Ids, action }

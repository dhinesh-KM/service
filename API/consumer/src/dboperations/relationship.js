const {Consumer} = require('../models/consumer')
const {SpecialRelationship, SharedDocument} = require('../models/relationship')
const CustomError = require('../middleware/customerror')
const logger = require('../configs/logger')
const status = require('http-status')
const mongoose = require('mongoose')
/**
 * 
 * @param {string} cofferid - cofferid of a consumer
 * @returns consumer object if consumer is found
 * @throws CustomError if consumer is not found
 */
async function consumer_ByCofferid(cofferid)
{
    console.log(cofferid)
    const con = await Consumer.findOne({ coffer_id: cofferid})
    if (con)
        return con

    throw new CustomError('Consumer not found', status.NOT_FOUND)
    

}

/**
 * getConsumer to get all consumers
 * @param {Object} params - contains cofferid
 * @returns {Object} - contains all consumer except logged in user
 */
 
async function getConsumer(params)
{
    const {cofferid} = params;

    //Retrieve all consumers except the logged-in user.
    let cons = await Consumer.find({coffer_id : { $ne : cofferid}}) 

    // Transform the 'cons' array to include only specific properties
    cons = cons.map( (data) => {  return { "firstName":data.first_name, "lastName":data.last_name, "email":data.email, "id":data._id} } )

    return {consumers: cons}
}

/**
 *  function to request an consumer to create relationship between them
 * @param {Object} data - contains cofferid(logged in user) and request body [ consumerId(cofferid of another consumer) and  description]
 * @returns success message 
 */
async function sprelationship_Request_Consumer(data)
{
    const {cofferid, consumerId, description} = data //logged in user cofferid
    const con = await consumer_ByCofferid(cofferid)
    const acp = await Consumer.findById(consumerId)
    console.log(con,acp)
    if (!acp)
        throw new CustomError('Consumer not found', status.NOT_FOUND)

    //Throw error if consumerId is user
    if (acp.coffer_id == cofferid)
        throw new CustomError('Operation not permitted', status.CONFLICT)

    // Check  the relationship is already created from the requestor's side, If found throw error
    const spr = await SpecialRelationship.findOne({requestor_uid : cofferid, acceptor_uid : acp.coffer_id })
    if (spr)
        throw new CustomError('Relationship already exists', status.CONFLICT)
    else
        {
            // Check if the relationship is already created from the acceptor's side, If found throw error
            const spr = await SpecialRelationship.findOne({requestor_uid : acp.coffer_id, acceptor_uid : cofferid })
            if (spr)
                throw new CustomError('Relationship already exists', status.CONFLICT)
            else    
                {
                    await SpecialRelationship.create({
                        requestor_type : 'consumer',
                        requestor_uid : cofferid,
                        requestor_tags : ['Personal'],
                        acceptor_type : 'consumer',
                        acceptor_uid : acp.coffer_id,
                        acceptor_tags : ['Personal'],
                        created : Date.now(),
                        status : 'requested',
                        description : description,
                    })
                    console.log(`\n----VitaGist Relationship request----\n\t\t ${con.consumer_fullname()} has requested you to confirm and accept the relationship with them`)

                    return { msg : 'Request sent successfully.'}
                }
        }
}

/**
 * function to accept the relationship requested by another consumer
 * @param {Object} data - contains request body(response(accept or reject)) and cofferid(logged in user) and relid(special relationship objectID)
 * @returns success message
 */
async function sprelationship_Accept_Consumer(data)
{
    const {response, cofferid, params: {relid}, reject_reason } = data
    
    const spr = await SpecialRelationship.findById(relid)
    let msg

    if (!spr )
        throw new CustomError('Relationship not found', status.NOT_FOUND)
    console.log(spr.isaccepted)
    // Throw error if relationship already accepted
    if (spr.isaccepted) 
        throw new CustomError('Relationship already accepted.', status.CONFLICT)
    
    if (response == 'accept')
        {
            // Ensure the acceptor user ID matches the expected coffer ID; otherwise, throw an error indicating a conflict
            if (spr.acceptor_uid != cofferid)
                throw new CustomError('You are not permitted to accept the relationship', status.CONFLICT)
            spr.isaccepted = true
            spr.accepted_date = Date.now()
            spr.status = 'accepted'
            msg  = 'Relationship accepted successfully.'
        }
    /*if (response == 'reject')
        {
            // Ensure the acceptor user ID matches the expected coffer ID; otherwise, throw an error indicating a conflict
            if (spr.acceptor_uid != cofferid)
                throw new CustomError('You are not permitted to reject the relationship', status.CONFLICT)
            spr.isaccepted = false
            spr.status = 'rejected'
            spr.reject_reason = reject_reason || ''
            msg = 'Relationship rejected successfully.'
        }*/

    await spr.save()

    return { msg: msg}
}

/**
 * A function to get all relationships (or) get all relationships by tag [ estblished between logged in user and other ]
 * @param {Object} data - contains cofferid(logged in user) and tag parameter
 * @returns all relationships (or) all relationships by tag of the consumer
 */
async function getRelationships(data)
{

    let business_name,biztype,guid,can_accept = false,profileUrl,result_data = [],tags
    
    const {cofferid, params: {tag} = {}} = data

    //Transform the special relationship object data
    async function modify(item)
    {
        //If the user is requestor then modify the data to display acceptor details
        if (item.requestor_uid == cofferid)
            {
                const con = await consumer_ByCofferid(item.acceptor_uid)
                biztype = 'consumer'
                business_name = con.consumer_fullname()
                guid = con.guid()
                profileUrl = con.profileUrl || ''
                tags = ['Personal']
                    
            }
        //If the user is acceptor then modify the data to display requestor details
        if (item.acceptor_uid == cofferid)
            {
                const con = await consumer_ByCofferid(item.requestor_uid)
                biztype = 'consumer'
                business_name = con.consumer_fullname()
                guid = con.guid()
                profileUrl = con.profileUrl || ''
                tags = ['Personal']
                    
                // If user is acceptor and isaccepted is false then can_accept true , otherwise false
                if (item.isaccepted == false)
                    can_accept = true
            }
        result_data.push({
            'id': item._id,
            'isSpecial': true,
            'canAccept': can_accept,
            'business_name': business_name,
            'business_category': '',
            'products': [],
            'description': '',
            'isaccepted': item.isaccepted,
            'isarchived': false,
            'status': item.status,
            'documents': {},
            'profile': {},
            'biztype': biztype,
            'email': '',
            'mobile': '',
            'guid': guid,
            'tags': tags,
            'profileUrl': profileUrl})
    }

    let spr = [],spr1,spr2

    //If tag is defined then find relationship with tag
    if(tag != undefined)
        {
            spr1 = await SpecialRelationship.find({requestor_uid: cofferid, requestor_tags: tag})
            spr2 = await SpecialRelationship.find({acceptor_uid: cofferid, accepted_tags: tag})
        }
    else
        {
            spr1 = await SpecialRelationship.find({requestor_uid: cofferid})
            spr2 = await SpecialRelationship.find({acceptor_uid: cofferid})
        }
    spr  = [...spr1,...spr2]

    // Iterate over each item in array of relationship objects and apply 'modify' function asynchronously to transform data
    for( const item of spr)
        await modify(item)

    return {data: { relationships : result_data }}

}

/**
 * function to get relationship tag counts
 * @param {Object} data - contains cofferid(logged in user)
 * @returns tagName with its count
 */
async function sprelationship_TagCount(data)
{
    const {cofferid} = data

    // tags count array
    const tags_count = [];

  
    let doc = []
    const spr1 = await SpecialRelationship.find({requestor_uid: cofferid})
    const spr2 = await SpecialRelationship.find({acceptor_uid: cofferid})
    
    doc  = [...spr1,...spr2]
    // reduce documens into a single array
    doc = doc.reduce( (obj,data) => {  
        if (data.requestor_uid == cofferid)
            obj[data.requestor_tags[0]] += 1

        if (data.acceptor_uid == cofferid)
            obj[data.acceptor_tags[0]] += 1

        return obj
    },{ Personal:0, ContentCoffer:0, Lauditor:0, })


    // filter tags greater than zero
    for (let [tag,value] of Object.entries(doc))
        {
            if (value > 0)
                tags_count.push({tagName:tag,count:value})
        }

    return {counts: tags_count}
}


async function shareDocs(data)
{
    const {cofferid, params: {rel_id}, add, remove, docs} = data
    let sharedWith, err_Msg = '', name = "Documents", result_Msg
    console.log("********",data)

    const spr = await SpecialRelationship.findById(rel_id)
    if (spr == null)
        throw new CustomError('Relationship not found.', status.NOT_FOUND)

    if (!spr.isaccepted)
        throw new CustomError('Relationship not accepted.', status.ACCEPTED)

    for (const data in docs)
    {
        const id = docs[data].missingIds
        const len = docs[data].missingIds.length
        if (len != 0)
            err_Msg += len == 1 ? `${data} document with this ID ${id} not found` : 
                              `${data} documents with these IDs ${id} not found`
    }
    if (err_Msg.length != 0)
        throw new CustomError(err_Msg, status.NOT_FOUND)
    
    sharedWith = spr.acceptor_uid
    if (sharedWith == cofferid)
        sharedWith = spr.requestor_uid

    const con = await consumer_ByCofferid(sharedWith)
    if (add != undefined)
        {
            if (add.length == 1)
                name = docs[add[0].doctype].docname

            for (const data of add)
                {
                    const shrdoc = await SharedDocument.findOne({relationship_id: rel_id, docid: data.docid})
                    if (!shrdoc)
                        await SharedDocument.create({
                            relationship_id: rel_id,
                            relationship_type: 'consumer to consumer',
                            shared_with: sharedWith,
                            shared_by: cofferid,
                            docid: data.docid,
                            doctype: data.doctype
                        })
                } 
            result_Msg = `${name} shared with ${con.consumer_fullname()}.`
        }
    else
        {
            if (remove.length == 1)
                name = docs[remove[0].doctype].docname

            let docids = remove.reduce( (arr,data) => 
                {
                    arr.push(data.docid)
                    return arr
                },
                []
            )

            await SharedDocument.deleteMany({relationship_id: rel_id, docid: { $in: docids}, shared_by: cofferid})
            result_Msg = `${name} unshared with ${con.consumer_fullname()}.`
        }

    return { msg: result_Msg}
}

async function share(data)
{ 
    const { params: {docs} } = data
    return {data: docs}

}

async function sprByRelId(rel_id)
{
    const spr = await SpecialRelationship.findById(rel_id)
    if (!spr)
        throw new CustomError('Relationship not found.', status.NOT_FOUND)
    return spr
}

async function action()
{
    const {params: {rel_id}} = data

    const spr = await sprByRelId(rel_id)

    if (!spr.isaccepted)
        throw new CustomError('Relationship not accepted.', status.ACCEPTED)


}










module.exports = {getConsumer, sprelationship_Request_Consumer, sprelationship_Accept_Consumer, getRelationships, sprelationship_TagCount, 
    shareDocs, share}
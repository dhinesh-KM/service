const {Consumer} = require('../models/consumer')
const {SpecialRelationship, SharedDocument} = require('../models/relationship')
const CustomError = require('../middleware/customerror')
const logger = require('../configs/logger')
const status = require('http-status')

/**
 * 
 * @param {string} cofferid - cofferid of a consumer
 * @returns consumer object if consumer is found
 * @throws CustomError if consumer is not found
 */
async function consumer_ByCofferid(cofferid)
{
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

    if (spr == null)
        throw new CustomError('Relationship not found', status.NOT_FOUND)

    // Ensure the acceptor user ID matches the expected coffer ID; otherwise, throw an error indicating a conflict
    if (spr.acceptor_uid != cofferid)
        throw new CustomError('You are not permitted to accept the relationship', status.CONFLICT)
    
    // Throw error if relationship already accepted
    if (spr.isaccepted) 
        throw new CustomError('Relationship already accepted.', status.CONFLICT)
    
    if (response == 'accept')
        {
            spr.isaccepted = true
            spr.accepted_date = Date.now()
            spr.status = 'accepted'
            msg  = 'Relationship accepted successfully.'
        }
    if (response == 'reject')
        {
            spr.isaccepted = false
            spr.status = 'rejected'
            spr.reject_reason = reject_reason || ''
            msg = 'Relationship rejeccted successfully.'
        }

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
    const {cofferid, params: {rel_id}, add, pdoc_ids} = data

    const spr = await SpecialRelationship.findById(rel_id)
    if (spr == null)
        throw new CustomError('Relationship not found', status.NOT_FOUND)


    for (const data of add.data)
    {
        await SharedDocument.create({
            relationship_id: rel_id,
            relationship_type: 'consumer to consumer',
            shared_with: spr.acceptor_uid,
            shared_by: spr.requestor_uid,
            docid: data.docid,
            doctype: data.doctype
        })
    }
    


    //const doc = await 



}










module.exports = {getConsumer, sprelationship_Request_Consumer, sprelationship_Accept_Consumer, getRelationships, sprelationship_TagCount, shareDocs}
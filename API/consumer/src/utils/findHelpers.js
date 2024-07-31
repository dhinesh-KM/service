const {Consumer,Reminder} = require('../models/consumer')
const {SpecialRelationship, SharedDocument} = require('../models/relationship')
const CustomError = require('../middleware/customerror')
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
    if (!con)
        throw new CustomError('Consumer not found', status.NOT_FOUND)

    return con
}

async function spr_ById(relid)
{
    const spr = await SpecialRelationship.findById(relid)
    if (!spr )
        throw new CustomError('Relationship not found', status.NOT_FOUND)
    return spr
}

module.exports = {consumer_ByCofferid, spr_ById }
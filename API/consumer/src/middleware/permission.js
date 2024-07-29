const {Reminder} = require('../models/consumer');
const CustomError = require('./customerror');
const axios = require('axios')
const config = require('../configs/config')

async function IsUser (req,res,next){
    try{
        const id = req.params.remid
        const rem = await Reminder.findById(id)
        if (!rem)
            return next(new CustomError(`Reminder with id ${id} not found.`,404)) 

        if (req.user.coffer_id == rem.consumer)
            next()

        else
            return next(new CustomError("Unauthorized",401))
    }
    catch(err){
        next(err);
    }
}


module.exports = {IsUser};
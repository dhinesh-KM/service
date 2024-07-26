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

// Fetches user personal docs data from document service using Axios.
async function FetchData(next,req)
{
    try{
        
        const headers = { "Authorization" : `${req.header('Authorization')}` };

        //seperate the personal doc ids and identity doc ids to make payload for subsequest http request
        const docid = req.body.add.reduce( (obj,data) => { 
            if (data.doctype == 'identity')
                obj['identity'].push(data.docid)
            else
                obj['personal'].push(data.docid)
            return obj
        },{"identity": [], "personal": []})
        
        const personal_payload = { docid: docid.personal}
        const identity_payload = { docid: docid.identity}


        // Make an asynchronous POST request to the personal document  endpoint to get missing ids
        const response1 = await axios.post(`${config.domain}/api/v1/consumer/p-docs`, personal_payload,{ headers } );
        console.log("=========",response1.data)
        return [response1.data]
    }
    catch(err){
        next(`Axios error: ${err}`);
    }
}

// Middleware function to fetch and process user personal docs data
/* This function fetches data using the FetchData function, processes the information, 
    and attaches the processed data to the request object for further use in the middleware chain. */

async function personalDocs(req,res,next)
{
    try{

        // Fetch data using the FetchData function, passing the next middleware function and the Authorization header
        const response = await FetchData(next,req);
        console.log(response)
        const ids = {personal: response[0].data,}// identity: response[1].data.data}
        req.body.docs = ids
        next();
    }
    catch(err)
    {
        next(err);
    }
}



module.exports = {IsUser,personalDocs};
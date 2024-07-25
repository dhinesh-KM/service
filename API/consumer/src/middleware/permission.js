const {Reminder} = require('../models/consumer');
const CustomError = require('./customerror');
const axios = require('axios')

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
async function FetchData(next,token)
{
    try{

        const headers = { "Authorization" : `${token}` };

        // Make an asynchronous GET request to the personal document  endpoint
        const response = await axios.get(`${config.domain}/api/v1/consumer/p-docs`, { headers });
        return response
    }
    catch(err){
        next(err);
    }
}

// Middleware function to fetch and process user personal docs data
/* This function fetches data using the FetchData function, processes the information, 
    and attaches the processed data to the request object for further use in the middleware chain. */

async function personalDocs(req,res,next)
{
    try{

        // Fetch data using the FetchData function, passing the next middleware function and the Authorization header
        const response = await FetchData(next,req.header('Authorization'));
        console.log(response)
        let docs = response.data.data;

        const docid = req.data.add.reduce( (arr,data) => { 
            arr.push(data.docid)
            return arr
        },[])
        
        console.log(docs,docid)

        req.params.citizen = citizen;
        next();
    }
    catch(err)
    {
        next(err);
    }
}



module.exports = {IsUser,personalDocs};
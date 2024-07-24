const {Reminder} = require('../models/consumer');
const CustomError = require('./customerror');

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

// Fetches user profile data from consumer service using Axios.
async function FetchData(next,token)
{
    try{

        const headers = { "Authorization" : `${token}` };

        // Make an asynchronous GET request to the consumer profile endpoint
        const response = await axios.get(`${config.domain}/api/v1/consumer/profile`, { headers });
        return response
    }
    catch(err){
        next(err);
    }
}

// Middleware function to fetch and process citizenship data
/* This function fetches data using the FetchData function, processes the citizenship information, 
    and attaches the processed data to the request object for further use in the middleware chain. */

async function con_citizenships(req,res,next)
{
    try{

        // Fetch data using the FetchData function, passing the next middleware function and the Authorization header
        const response = await FetchData(next,req.header('Authorization'));
        let citizen = response.data.data.citizen;

        
        
        // Process the citizen data, reducing it to an object where keys are the data index(citizen_primary..) and values are the country names
        citizen  = citizen.reduce((obj,data) => {  
            return obj = {...obj,[`${data.index}`] : `${data.country}`}; 
        },{});

        //Check for citizenship 
        if (!Object.keys(citizen).includes(req.params.cat))
            throw new CustomError("Citizenship not found", 404);

        req.params.citizen = citizen;
        next();
    }
    catch(err)
    {
        next(err);
    }
}



module.exports = IsUser;
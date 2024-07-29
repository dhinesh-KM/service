const { SharedDocument} = require('../models/relationship')

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
/* This function fetches data using the FetchData function, 
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

async function docDetails(req, res, next)
{
    try{
        let docs = await SharedDocument.find({relationship_id: req.params.rel_id})
    
        docs = docs.reduce( (obj,data) => { 
                obj[data.doctype].push(data.docid)
                return obj
        },{personal: [], identity: []})

        const personal_payload = { docid: docs.personal}
        const identity_payload = { docid: docs.identity}


        // Make an asynchronous POST request to the personal document  endpoint to get missing ids
        const personalResponse = await axios.get(`${config.domain}/api/v1/consumer/p-docs/details`, personal_payload,{ headers } );
        return [personalResponse.data]
    }
    catch(err){
        next(`Axios error: ${err}`);
    }

}







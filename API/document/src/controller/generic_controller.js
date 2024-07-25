/* Higher-order function 'get,post,patch,delete' that takes a 'method' parameter and
   Return an asynchronous middleware function with parameters 'req', 'res', and 'next'
   Set necessary fields to 'req.params' and extract params object from 'req.params'
   Call the 'method' function with 'params' and await its result
   Extract 'status' from 'result' and delete 'status' property from 'result'
   Send HTTP response with 'status' code and JSON 'result'
   Forward any caught errors to the next error-handling middleware */

const status = require('http-status');
const asynchandler = require('express-async-handler')
const {invalidateCache, requestToKey} = require('../middleware/redis');

function cachekeyurls(cat,tags)
{
    let result = [];

    if (!tags.includes('LegalFinance') && (tags.includes('Finance') || tags.includes('Legal')) )
        result.push(`/personal/tagged/${cat}/LegalFinance`);

    
    const t = tags.map( (data) => {

        result.push(`/personal/tagged/${cat}/${data}`);
    })
    
    return [`/personal/${cat}`,`/personal/counts/${cat}`,...result];
}

function cache_invalidation(req,tags,path)
{ 
    let urls = cachekeyurls(req.params.cat,tags);
    if(path)
        urls = [...urls,...path]
    //console.log(urls)
    urls.map(async (data) => {
        data = requestToKey(req.user.coffer_id,data);
        await invalidateCache(data);
    })

}


const get = (method) => {
    
    return asynchandler(async(req,res) => {
        const params = {...req.params, cofferid: req.user.coffer_id };
        const result = await method(params);
        res.status(status.OK).json(result);
        })
    
}

const post = (method) => {
    return asynchandler(async(req,res) => {
        const params = { ...req.params, cofferid: req.user.coffer_id, file: req.file };
        const data = req.body;
        cache_invalidation(req, req.body.tags)

        const result = await method(params,data);
        res.status(status.CREATED).json(result);
    })
}

const patch = (method) => {
    return asynchandler(async(req,res) => {

            const tags = ["Health", "Personal", "Legal", "Finance", "Others", "LegalFinance"]
            const params = { ...req.params, cofferid: req.user.coffer_id };
            const data = req.body;
            const path = [`/personal/${req.params.cat}/${req.params.doc._id}/details` ]

            cache_invalidation(req, tags, path)
            /*we give all tags because when update, all tag specific endpoints shuold be invalidated( because when we give updated tags it only
            invalidate updated tag cahce key )*/

            const result = await method(params,data);
            res.status(status.OK).json(result);
    })
}

const Delete = (method) => {
    return asynchandler(async(req,res) => {

            const params = { ...req.params, cofferid: req.user.coffer_id };
            const path = [`/personal/${req.params.cat}/${req.params.doc._id}/download`,
                            `/personal/${req.params.cat}/${req.params.doc._id}/view`,
                            `/personal/${req.params.cat}/${req.params.doc._id}/details`]

            cache_invalidation(req,req.params.doc.tags,path) 
        
            const result = await method(params);
            res.status(status.OK).json(result);
    })
}

const retrive = (method) => {
    
    return asynchandler(async(req,res) => {
        const data = req.body
        data.cofferid = req.user.coffer_id 
        const result = await method(data);
        res.status(status.OK).json(result);
        })
    
}




module.exports = {get, post, patch, Delete, retrive};
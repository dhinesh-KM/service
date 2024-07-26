const {PersonalDocument, IdentityDocument} = require('./model');
const {CustomError} = require('./middleware/customerror');
const moment = require('moment');
const logger = require('./configs/logger');
const status = require('http-status');
const { default: mongoose } = require('mongoose');




// get all personal documents based on citizenship type of a user
async function get_citz_docs(params)
{
    const {cat,cofferid} = params;
    let doc = await PersonalDocument.find({category: cat, consumer:cofferid}); 

    // add URL in the array of documents response
    doc =   doc.map(async (data) => {
        return  { ...data.GetDocData(), url : await data.view()};
    });
    
    //  Resolve all the document Promises 
    doc = await Promise.all(doc)
    
    return {data: doc}
}

// get personal documents count by tags
async function get_doc_count(params)
{ 
    // Initialize an object to store tag counts
    const tags = { Personal:0, Health:0, Legal:0, Finance:0, LegalFinance:0, Others:0}
    // tags count array
    const tags_count = [];

    // count function for tags
    function count(tag)
    {
        if (Object.keys(tags).includes(tag))
                tags[tag] += 1;
    }

    const {cat,cofferid} = params;
    let doc = await PersonalDocument.find({category:cat,consumer:cofferid}).select('tags -_id');

    
    // reduce documens into a single array
    doc = doc.reduce( (arr,data) => {  return arr.concat(data.tags)},[])

    // count the tags using above count function 
    doc.forEach(count); 

    // filter tags greater than zero
    for (let [tag,value] of Object.entries(tags))
        {
            if (value > 0)
                tags_count.push({tagName:tag,count:value})
        }

    return {data: tags_count}
}

// get personal documents based on tags 
async function get_tag_docs(params)
{
    const {cat,tag,cofferid} = params;
    let doc = await PersonalDocument.find({category:cat,consumer:cofferid,tags:tag});

    // add URL in the array of documents response
    doc =   doc.map(async (data) => {
        return  { ...data.GetDocData(), url : await data.view()};
    });
    
    //  Resolve all the document Promises 
    doc = await Promise.all(doc)
    return {data: doc};
}

// Function to add legalfinance
function leg_fin(tags)
{
    for (let i of ["Legal","Finance"])
        {
            if (tags.includes(i)) 
                {
                    tags.push("LegalFinance");
                    return tags
                }
        }
    return tags
}

//  personal documents operations based on action 
async function personalDoc_Operations(params,data)
{ 
    const {cat,cofferid, id,file,citizen, action,doc} = params;

    switch(action)
    {
        case 'create':
            {
                console.log("create", params)
                if(!file)
                    throw new CustomError('File is not provided', status.BAD_REQUEST)

                // Check for personal document with same name 
                let pdoc = await PersonalDocument.find({consumer: cofferid})
                pdoc = pdoc.filter((item) =>{
                    if (item.name.toLocaleLowerCase() == data['name'].toLocaleLowerCase())
                        throw new CustomError("Document with same already exists",409);
                });             

                // Add LegalFinace if any one ("Legal","Finance") is present
                data['tags'] = leg_fin(data['tags'])

                // Format the exp_date
                if("expiration_date" in data && data["expiration_date"] != undefined)
                    data["expiration_date"] = moment(data["expiration_date"], "DD-MM-YYYY").format("YYYY-MM-DD");

            
                data["consumer"] = cofferid;
                data["filename"] = file.originalname;
                data["filesize"] = file.size;
                data["content_type"] = file.mimetype;
                data["category"] = cat;
                data["created"] = Date.now();
                data["country"] = citizen[cat];
                

                const doc = await PersonalDocument.create(data);

                //  Uploading the file to Firebase Storage and getting the signed URL
                const url = await doc.save_file(file);          
                return {msg: 'Document uploaded successfully!','url':url};
            }
        case 'update':
            {
                // Check for personal document with same name 
                if ("name" in data)
                    {
                        let pdoc = await PersonalDocument.find({consumer: cofferid})
                        pdoc = pdoc.filter((item) =>{
                            if (item.name.toLocaleLowerCase() == data['name'].toLocaleLowerCase())
                                throw new CustomError("Document with same already exists",409);
                        });       
                    }
                
                // Format the exp_date
                if ("expiration_date" in data)
                    data["expiration_date"] = moment(data["expiration_date"], "DD-MM-YYYY").format("YYYY-MM-DD");

                // Add LegalFinace if any one ("Legal","Finance") is present
                if ("tags" in data)
                    data['tags'] = leg_fin(data['tags'])
            
                await PersonalDocument.findByIdAndUpdate(id, data); 
            
                return {msg: "Document updated successfully."}
            }
        case 'download':
            {
                const url = await doc.download();
                return {"url": url};
            }
        case 'view':
            {
                const url = await doc.view();
                return {"url": url};

            }
        case 'delete':
            {
                const doc = await PersonalDocument.findByIdAndDelete(id); 
                doc.delete()
                return { msg: "Document deleted successfully."}

            }
       case 'details':
            {
                let exp_date = "";
                let size = doc.filesize;

                // Date formatting
                const options = { month: 'short', day : "2-digit", year: 'numeric', hour: '2-digit', minute: '2-digit',  hour12: true }

                if (doc.expiration_date)
                    exp_date = doc.expiration_date.toLocaleDateString('en-US',options);

                // Format the file size based on its value:
                if (size <= 100)
                    size = `${size} B`
                else if (size > 100 && size <= 1024*1024)
                    size = `${(size / 1024).toFixed(2)} KB`
                else
                    size = `${(size / (1024*1024)).toFixed(2)} MB`
                
               data = { "name": doc.name,
                        "description": doc.description,
                        "tags": doc.tags,
                        "size": size,
                        "doctype": "general",
                        "expiringOn": exp_date,
                        "contentType":doc.content_type,
                        "uploadedOn": doc.created.toLocaleDateString('en-US',options),
                        "url": await doc.view(),
                        "sharedWith": "" }
                        
                return {details: data}
            }
        case 'tag_docs':
            {
                return await get_tag_docs(params);
            }
        case 'tags_count':
            {
                return await get_doc_count(params)
            }
        case 'citz_docs':
            {
                return await get_citz_docs(params)
            }
            
    }
    
}

async function getAllDocs(data)
{
    
    const {docid, cofferid} = data
    console.log(data)
    const ids = docid.map(id => new mongoose.Types.ObjectId(id));
    console.log(ids)
    const pdocs = await PersonalDocument.aggregate([
        {
          $match: {
            _id: { $in: ids }, consumer: cofferid
          }
        },
        {
          $group: {
            _id: null,
            existingIds: {$push: "$_id"},
            existingNames: {$push: "$name"}
          }
        },
        {
          $project: {
            _id: 0,
            existingIds: 1,
            existingNames: 1,
            missingIds: {
              $setDifference: [ids, "$existingIds"]
            }
          }
        }
      ]).exec()
    console.log("pdocs ",pdocs)
    const [mis_Ids,names] = pdocs.length == 0 ? [ids,[]] :  [pdocs[0].missingIds,pdocs[0].existingNames]
    
    return {data: {docname: names, missingIds: mis_Ids}}
}

/*async function identityDoc_Operations(params,data)
{ 
    const {cat,cofferid, id,file,citizen, action,doc} = params;

    //Check for citizenship 
    if (!Object.keys(citizen).includes(cat))
        throw new CustomError("Citizenship not found", 404);



    switch(action)
    {
        case 'create':
            {
                let content_type = file.mimetype;
                if (content_type.split('/')[0] != 'image' || content_type != 'application/pdf')
                    throw new CustomError('Only pdf files or images are accepted.',400)

                if ("expiration_date" in data)
                    data["expiration_date"] = moment(data["expiration_date"], "DD-MM-YYYY").format("YYYY-MM-DD");

                data["consumer"] = cofferid;
                data["filename"] = file.originalname;
                data["filesize"] = file.size;
                data["content_type"] = file.mimetype;
                data["category"] = cat;
                data["created"] = Date.now();
                data["country"] = citizen[cat];

                const doc = await IdentityDocument.create(data);

                //  Uploading the file to Firebase Storage and getting the signed URL
                const url = await doc.save_file(file);          
                return {msg: 'Document uploaded successfully!','url':url};

            }

    }
}*/


module.exports = { personalDoc_Operations, getAllDocs};
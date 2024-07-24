const mongoose = require('mongoose');
const firebaseStorage = require('./firebaseconfig');
const { CustomError } = require('./middleware/customerror');

const personalDocumentSchema = new mongoose.Schema(
    {
        consumer : { type: String}, 
        category : { type: String},  // citizen_primary
        name : { type: String},  // Name
        description : { type: String},  // Description
        expiration_date : { type: Date},  // Expiration Date
        filename : { type: String},  // File Name
        filesize : { type: Number},  // Integer Value // File Size
        content_type : { type: String},  // File Content-Type
        created : { type: Date},
        updated : { type: Date},
        metadata : { type: Map, of: String },
        ciphertext : { type: String}, 
        tags : [String],
        subtags : [String],
        country: {type: String} 
    }
)


//instance method named GetDocData for the PersonalDocumentSchema to get document data in a specific format
personalDocumentSchema.methods.GetDocData = function()
{
    const options = { month: 'short', day : "2-digit", year: 'numeric'};
    let exp_date = this.expiration_date || "";
    return {
            category : this.category,
            name : this.name,
            description : this.description,
            filename : this.filename,
            filesize : this.filesize,
            content_type : this.content_type,
            created : this.created.toLocaleDateString('en-US',options),
            tags :  this.tags ,
            subtags : this.subtags || [],
            expiration_date : exp_date != "" ? exp_date.toLocaleDateString('en-US',options) : "NA",
            id : this.id,
            country : this.country,
            

    }
}

// Construct a filename string using the consumer ID and the document's _id to store file with unique names
personalDocumentSchema.methods.Filename = function()
{
    return `con-${this.consumer}/pdoc-${this._id}`;
}


personalDocumentSchema.methods.view = async function()
{
    const params = {responseType : this.content_type};
    return await firebaseStorage.signed_url(this.Filename(),params);
}

personalDocumentSchema.methods.download = async function()
{
    const params = { responseDisposition : `attachment; filename=${this.filename}`, responseType : this.content_type };
    return await firebaseStorage.signed_url(this.Filename(),params);
}

personalDocumentSchema.methods.delete = async function()
{
    try{
        const file = firebaseStorage.bucket.file(this.Filename());
        await file.delete();
    }
    catch(err){ 
        throw new CustomError(`${err}`,500)
    };
}

personalDocumentSchema.methods.save_file = async function(file)
{
    const param = { contentType: this.content_type ,file: file.buffer };
    return firebaseStorage.save_obj(this.Filename(),param);
}





 
const PersonalDocument = mongoose.model('PersonalDocument', personalDocumentSchema);

//const IdentityDocument = mongoose.model('IdentityDocument', identityDocumentSchema);

module.exports = {PersonalDocument};

/*const identityDocumentSchema = new mongoose.Schema(
    {
        consumer : { type: String},
        category : { type: String},  // citizen_primary
        doctype  : { type: String}, // aadhar
        docid    : { type: String}, //aadhar-number
        expiration_date  : { type: Date},
        content_type : { type: String},  // File Content-Type
        filename : { type: String},    // File Name
        filesize : { type: Number},  // Integer Value // File Size
        created : { type: Date},
        updated : { type: Date},
        metadata : { type: Map, of: String },
        ciphertext : { type: String},
        verification_status : { type: String},
        validity_status : { type: String},
        verification_vendor : { type: String},
        tags : [String],
        country: {type: String}
        
    }
)

identityDocumentSchema.methods.getIdocData = function()
{
    const options = { month: 'short', day : "2-digit", year: 'numeric'};
    let exp_date = this.expiration_date || "";
    return {
            category : this.category,
            doctype : this.doctype,
            docid : this.docid,
            content_type : this.content_type,
            filename : this.filename,
            filesize : this.filesize,
            created : this.created.toLocaleDateString('en-US',options),
            verification_status: this.verification_status,
            validity_status: this.validity_status,
            tags :  this.tags ,
            expiration_date : exp_date != "" ? exp_date.toLocaleDateString('en-US',options) : "NA",
            id : this.id,
            country : this.country,
            
    }
}

// Construct a filename string using the consumer ID and the citizenship - document's type to store file with unique names
identityDocumentSchema.methods.Filename = function()
{
    return `con-${this.consumer}/${this.category}-${this.doctype}`;
}


identityDocumentSchema.methods.view = async function()
{
    const params = {responseType : this.content_type};
    return await firebaseStorage.signed_url(this.Filename(),params);
}

identityDocumentSchema.methods.download = async function()
{
    const params = { responseDisposition : `attachment; filename=${this.filename}`, responseType : this.content_type };
    return await firebaseStorage.signed_url(this.Filename(),params);
}

identityDocumentSchema.methods.delete = async function()
{
    try{
        const file = firebaseStorage.bucket.file(this.Filename());
        await file.delete();
    }
    catch(err){ 
        throw new CustomError(`${err}`,500)
    };
}

identityDocumentSchema.methods.save_file = async function(file)
{
    const param = { contentType: this.content_type ,file: file.buffer };
    return firebaseStorage.save_obj(this.Filename(),param);
}*/

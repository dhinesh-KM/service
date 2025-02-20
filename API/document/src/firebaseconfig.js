const admin = require('firebase-admin')
const config = require('./configs/config')
const fs = require('fs')
const path = require('path')
const {CustomError} = require('./middleware/customerror')

const env = process.env.NODE_ENV
let serviceAccount

if (env == 'dev')
    serviceAccount = require('./serviceAccountkey.json')
if (env == 'prod')
    {
        const serviceAccountPath = path.resolve('/etc/secrets/serviceAccountKey.json');

        if (!fs.existsSync(serviceAccountPath)) 
            throw new CustomError('Service account key file not found.');
          
        // Read and parse the service account key file
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    }


/*const serviceAccount = { project_id: config.projectId, private_key: config.privateKey, client_email: config.clientEmail, type: config.type,
    private_key_id: config.project_key_Id, //client_id:  ,auth_uri: ,token_uri:  ,auth_provider_x509_cert_url:  ,client_x509_cert_url:  ,
    //universe_domain:  
 }*/



// Initialize the Firebase Admin SDK with service account credentials and specify the storage bucket
admin.initializeApp({
    credential : admin.credential.cert(serviceAccount), // Provide the service account credentials for authentication
    storageBucket : 'gs://fileuploads-82158.appspot.com' // Set the Cloud Storage bucket for file uploads
})

// Get a reference to the specified storage bucket
const bucket  = admin.storage().bucket()



//Generate a signed URL for the uploaded file
async function signed_url(filename,params)
{
    try{
        const file = bucket.file(filename)

        //Configuration for url
        let config = {action : 'read', expires: Date.now() + 60*60*1000, version: 'v2' }
        config = {...config, ...params}
        
        //return array of string
        const [url] = await file.getSignedUrl(config)  
        return url
    }
    catch(err){
            throw new CustomError(`URL Error: ${err}`,500)
    }
}


function save_obj(file,params) {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(file)

        // Create a writable stream to upload the file to Firebase storage
        const blobstream = blob.createWriteStream({
            metadata: {contentType: params.contentType }
        })

        // Set up an event listener for the 'finish' event
        blobstream.on('finish', async () => {
            try {
                const url = await signed_url(file)
                // Resolve the Promise with the signed URL
                resolve(url)
            } catch (err) {
                reject(new CustomError(`Signed URL call Error: ${err}`, 500))
            }
        })

        // Set up an event listener for the 'error' event
        blobstream.on('error', (error) => {
            reject(new CustomError(`Cloud Error: ${error}`, 500))
        })

        // End the stream and upload the file buffer
        blobstream.end(params.file)
    })
}


module.exports = {bucket, signed_url, save_obj}
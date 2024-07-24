const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountkey.json');
const {CustomError} = require('./middleware/customerror');

// Initialize the Firebase Admin SDK with service account credentials and specify the storage bucket
admin.initializeApp({
    credential : admin.credential.cert(serviceAccount), // Provide the service account credentials for authentication
    storageBucket : 'gs://fileuploads-82158.appspot.com' // Set the Cloud Storage bucket for file uploads
});

// Get a reference to the specified storage bucket
const bucket  = admin.storage().bucket();



//Generate a signed URL for the uploaded file
async function signed_url(filename,params)
{
    try{
        const file = bucket.file(filename)

        //Configuration for url
        let config = {action : 'read', expires: Date.now() + 60*60*1000, version: 'v2' };
        config = {...config, ...params}
        
        //return array of string
        const [url] = await file.getSignedUrl(config);  
        return url
    }
    catch(err){
            throw new CustomError(`URL Error: ${err}`,500);
    }
}


function save_obj(file,params) {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(file);

        // Create a writable stream to upload the file to Firebase storage
        const blobstream = blob.createWriteStream({
            metadata: {contentType: params.contentType }
        });

        // Set up an event listener for the 'finish' event
        blobstream.on('finish', async () => {
            try {
                const url = await signed_url(file);
                // Resolve the Promise with the signed URL
                resolve(url);
            } catch (err) {
                reject(new CustomError(`Signed URL call Error: ${err}`, 500));
            }
        });

        // Set up an event listener for the 'error' event
        blobstream.on('error', (error) => {
            reject(new CustomError(`Cloud Error: ${error}`, 500));
        });

        // End the stream and upload the file buffer
        blobstream.end(params.file);
    });
}


module.exports = {bucket, signed_url, save_obj};
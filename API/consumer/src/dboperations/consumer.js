const {Consumer,Reminder} = require('../models/consumer')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const utils = require('../utils/utils')
const CustomError = require('../middleware/customerror')
const logger = require('../configs/logger')
const moment = require('moment')
const otplib = require('otplib')
const status = require('http-status')
const jwt = require('jsonwebtoken')
const config = require('../configs/config')
let lastgeneratedtime

// Handle not found error
function notFound()
{
    throw new CustomError('Account not found', status.NOT_FOUND)
}

// Cofferid generation using crypto library
async function generateCofferid()
{
    const cid = crypto.randomBytes(8).toString('hex')
    const con = await Consumer.findOne({coffer_id : cid})
    if (con)   
        return await generateCofferid() 
    return cid
}

// Find consumer by email or other
async function consumerFind(query)
{
    if (Object.keys(query) == 'email')
            query.email = query.email.toLowerCase()

    return await Consumer.findOne(query)
}

// Consumer instance creation
async function createUser(data)
{
    // Default citizen ship in citizen primary
    const country_data = {
        'index': 'citizen_primary',
        'country': data['country'],
        'affiliation_type': 'citz'
    }
        
    data['coffer_id'] = await generateCofferid()
    data['password'] = await bcrypt.hash(data['password'],10) // Hash the password
    data["joined"] = Date.now()
    delete data['confirm_password']

    // Create an instance of consumer 
    const user = new Consumer(data)
    user.citizen = [country_data]

    return user

}

// Notify the Consumer through email for email verification at update profile
async function notifyEmail(user,email)
{

    await check({email:email})
    
    user.email = email.toLowerCase()
    user.email_verified = false
    email_verification_token = crypto.randomBytes(8).toString('hex')

    console.log("\n ---------- vitagist email verfication ----------\nName: ", user.consumer_fullname(),`\ntoken: ${email_verification_token}\n`)

    user.email_verification_token = email_verification_token
    return user

}

// Notify the Consumer through mobile for mobile verification at update profile
async function notifyMobile(user,mobile)
{

    await check({mobile:mobile})

    user.mobile = mobile
    user.mobile_verified = false
    mobile_verification_token = crypto.randomBytes(8).toString('hex').toUpperCase()

    console.log(`\n ---------- VitaGist  Mobile Verification ----------\n\t\tNumber: ${utils.get_country_phone_code(user.country)} `,user.mobile ,"\n\t\tmsg: ",`Use token ${mobile_verification_token} to verify your mobile and get started with DigiCoffer Personal\n`)

    user.mobile_verification_token = mobile_verification_token 
    return user
}

// Verify the Consumer by email or mobile
async function email_Mobile_Verification(con, verify_type, token)
{
   
    // check received token and token in consumer data are same 
    if (token == con[`${verify_type}_verification_token`])
        {
            // If same change the token to null and status to true
            con[`${verify_type}_verified`] = true
            con[`${verify_type}_verification_token`] = null

            await con.save()

            return { msg: `${verify_type} verification successful.`}
        }
    throw new CustomError('please enter a valid token', status.BAD_REQUEST)
    
}

// Consumer creation
async function  consumerCreate(data)
{
    const user = await createUser(data)

    // User authenticate either by email or mobile
    if ('email' in data)
        await notifyEmail(user,data["email"])

    else if ('mobile' in data)
        await notifyMobile(user,data["mobile"])
    
    await user.save()

    return { msg: 'Consumer created successfully.'}
    
}

// Verify the  registered consumer through email_Mobile_Verification 
async function consumer_Registration_Verify_Section(params,data)
{
    const {verify_type,token_type} = params

    // Consumer find based on verify type
    if (verify_type == 'email')
        con = await consumerFind({email: data['email']})

    else if (verify_type == 'mobile')
        con = await consumerFind({mobile: data['mobile']}) 

    // Check consumer exist or not
    if (con)
        {
            // Verify or resend based on token type
            if (token_type == 'resend')
                {
                    if (verify_type == 'email')
                        console.log(" ------------- VitaGist Personal Email Verification ------------\nName: ", con.consumer_fullname() ,"\ntoken: ",con.email_verification_token)
                    
                    else if (verify_type == 'mobile')
                        console.log(" ------------- VitaGist Personal Mobile Verification ------------\nNumber: ",`${utils.get_country_phone_code(con.country)} ${con.mobile}`,"\nmsg: ",`Use token ${con.mobile_verification_token} to verify your mobile and get started with DigiCoffer Personal`)

                    return { msg: 'Resend successful.', token: con[`${verify_type}_verification_token`]}
                }
            else if (token_type == 'verify')
                {
                    token = data['token']
                    return  await email_Mobile_Verification(con,verify_type,token)
                }
        }
    throw new CustomError('Account not found', status.NOT_FOUND)
        
}

// Get ethinicity and bloog group from utils
function getEthinicity() {  return utils.ETHINICTY  }

function getBloodgroup() {  return utils.BLOOD_GROUPS }

// Update the password
async function update_password(con,o_password,n_password)
{
    const password = await bcrypt.compare(o_password,con.password)

    if(!password)
        throw new CustomError("Invalid old password", status.BAD_REQUEST)

    return await bcrypt.hash(n_password,10)
}


// Check for email or mobile already exists or not
async function check(data)
{
    const type = Number(Object.values(data)[0]) // It converts mobile to number & email to NaN
    const user = await consumerFind(data)
    if (user)
        throw new CustomError(
            isNaN(type)  
                ? 'Email ID is already registered with DigiCoffer Personal.'
                : 'Mobile number is already registered with DigiCoffer Personal.',
                status.CONFLICT
        )              
}

// Consumer profile details update
async function consumer_update(data)
{
    const cofferid = data["cofferid"]
    const fields = ["first_name","last_name","middle_name"]

    // Get consumer data to update
    let con = await consumerFind({coffer_id: cofferid})

    //  Profile details will be update if they are in data and data not same as before
    fields.forEach((field) => {
        if (field in data && data[field] != con[field])
            con[field] = data[field]
    })

    if ( "dob" in data && data["dob"] != con.dob)
            con.dob = moment(data["dob"], "DD-MM-YYYY").format("YYYY-MM-DD")

    if ( "old_password" in data)
        con.password = await update_password(con,data['old_password'],data['new_password'])

    if("mobile" in data && data["mobile"] != con.mobile)
            await notifyMobile(con,data["mobile"])
        

    if ( "email" in data && data["email"] != con.email )
        await notifyEmail(con,data["email"])
    
    await con.save()
    return { msg: "profile details updated successfully" } 
        
   
}

// Verify the updated email or mobile of a consumer
async function verify_email_mobile(params,data) 
{
    const cofferid = data["cofferid"]
    const{verify_type} = params

    const con = await consumerFind({coffer_id:cofferid})

    return await email_Mobile_Verification(con, verify_type, data["token"])
}

// Retrive consumer profile details
async function get_consumer(data)
{
    const cofferid  = data["cofferid"]
    const con = await consumerFind({coffer_id:cofferid})
    return { data: con.GetConsumerData()  }
}

// OTP generation
function OTP()
{
    const otp = otplib.authenticator.generate(config.secretKey)
    lastgeneratedtime = new Date()
    return otp
    
}

/**
 * Checks the validity of the provided OTP.
 *
 * @param {string} data - The OTP provided by the user.
 * @returns {boolean} Returns true if the OTP is valid.
 * @throws {CustomError} If the OTP is expired or invalid.
 */
function checkOtp(data)
{
    if ((new Date() - lastgeneratedtime) >= 300000)
            throw new CustomError("OTP is expired", status.BAD_REQUEST)
        
    else
        {
            const otp = otplib.authenticator.check(data, config.secretKey)
            if (otp)
                return true

            throw new CustomError("Invalid OTP", status.BAD_REQUEST)
        }
}

/**
 * Sends an OTP to the user for password reset.
 *
 * @param {string} verify_type - The type of verification method, either "email" or "mobile".
 * @param {Object} con - The user context containing user details.
 * @returns {Object} An object containing a success message and the user's coffer ID.
 */
function otpSend(verify_type,con)
{
    if (verify_type == "email" )
        console.log(" ------------ VitaGist Personal Password Reset ------------ \n\t\tName: ", con.consumer_fullname() ,"\n\t\tOTP: ",OTP())
    else
        console.log(" ------------ VitaGist Personal Password Reset ------------ \n\t\tNumber: ",`${utils.get_country_phone_code(con.country)} ${con.mobile}`,"\n\t\tmsg: ","Use OTP" ,OTP(), "to verify your mobile and get started with DigiCoffer Personal")
    
    return { msg: `An OTP to reset your password is sent to your ${verify_type}. It is valid for 5 mins`, coffer_id: con.coffer_id, }
}



/**
 * Handles the forget password process by verifying user data and sending an OTP.
 * 
 * @param {Object} params - Parameters for the forget password operation.
 * @param {string} params.verify_type - The type of verification ,either "email" or "mobile".
 * @param {Object} data - The data provided for identifying the user, either "email" or "mobile".
 * @returns {Object} Returns otpSend success msg.
 * @throws {CustomError} If the account is not found.
 */
async function forget(params,data)
{
    const con  = await consumerFind({ [`${Object.keys(data)}`] : `${Object.values(data)}`})
    if(con)
        return otpSend(params.verify_type,con)

    throw new CustomError('Account not found',status.NOT_FOUND)

}

/**
 * 
 * @param {Object} params - contains verify type( either "email" or "mobile" )and token type (either "resend" or "verify".)
 * @param {Object} data - contains cofferid,password,otp 
 * @returns {Object} - return success msg
 */
async function forgetCheck(params,data)
{
    const {verify_type, token_type} = params
    const con  = await consumerFind({ coffer_id : data['coffer_id']})

    if(con)
        {
            // call otpSend to to resend
            if(token_type == "resend")
                return otpSend(verify_type,con)
            else
                {
                    if (checkOtp(data["otp"])) 
                        {
                            con.password = await bcrypt.hash(data["password"],10)
                            con.save()
                            return { msg: "Password reset successful. Please login to access your Coffer.", }
                        }
                }
        }
    throw new CustomError('Account not found',status.NOT_FOUND)
}

/** 
    * Consumer can create,retrive and delete remiders based on action.
    *
    * @param {Object} data - contains cofferid,action, request body of reminder for post method , route parameter for delete method.
    * @returns {Object} - return success msg for create and delete, reminder data for get.
*/
async function reminder(data)
{
    
    const cofferid = data["cofferid"]
    const con  = await consumerFind({ coffer_id : cofferid})
    const options = { month: 'short', day : "2-digit", year: 'numeric'} // Date formatter

    if (data["action"] == "create")
        { 
            data["consumer"] = cofferid
            data["created"] = Date.now()
            data['target'] = moment(data["target"], "DD-MM-YYYY").format("YYYY-MM-DD")
            await Reminder.create(data)
            return { msg: "Reminder created successfully" }
        }
    if (data["action"] == "get")
        {
            const rem = await Reminder.find({consumer: cofferid})
            // Tranform all reminder created and target date to specific format
            const reminder =  rem.map(data => ( {_id: data._id, message: data.message, created : data['created'].toLocaleDateString('en-US',options), target : data['target'].toLocaleDateString('en-US',options) }))   
            return { data: { reminder } }
        }
    if (data["action"] == "delete")
        {
            await Reminder.deleteOne({_id: data['remid'] })
            return { msg: "Reminder deleted successfully" }
        }

}













const generateToken = (con) => { 
    const payload = {
        coffer_id: con.coffer_id, 
        pk: con.pk
    }
    
    // Generate JWT token with secret key and expiration time
    const token = jwt.sign(payload, config.secretKey, { expiresIn: '24h' })
    return token
}

async function login(data) {
    const query = {}
    if (data['email']) 
        query.email = data['email']
    else
        query.mobile = data['mobile']
    const con = await consumerFind(query)
    if (!con) {
        throw new CustomError('Consumer not found', status.NOT_FOUND,)
    }

    if (!await con.isPasswordMatch(data['password'])) {
        throw new CustomError( 'Invalid email or password', httpStatus.BAD_REQUEST,)
    }

    if (!con.lastlogin) {
        console.log(
            '==========>>>>>> SEND WELCOME EMAIL <<<<<<=========='
        )
    }

    con.lastlogin = Date.now()

    const ctxt = {
        coffer_id: con.coffer_id,
        custom_uid: con.custom_uid,
        first_name: con.first_name,
        last_name: con.last_name,
        email_verified: con.email_verified,
        mobile_verified: con.mobile_verified,
        lastlogin: con.lastlogin,
        email: con.email,
        mobile: con.mob ? con.mob : '',
        pk: con._id,
        password_mode: con.password_mode,
    }

    await con.save()
    logger.info(`${con.first_name} - Login successful`)

    const token = generateToken(ctxt)
    return {
        error: false,
        token: token,
        data: ctxt,
    }
}



                 
module.exports = {login, consumerCreate, consumer_Registration_Verify_Section, getBloodgroup, getEthinicity, consumer_update, verify_email_mobile, get_consumer, forget, forgetCheck, reminder}


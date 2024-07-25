const Joi = require('joi');
const moment = require('moment');


const emailVerifySchema = Joi.object(
    {
        email : Joi.string().email().required().messages({'string.email': 'Invalid email address.'}),
        token : Joi.string().required()
    }
)

const mobileVerifySchema = Joi.object(
    {
        mobile : Joi.string().length(10).required(),
        token : Joi.string().required()
    }
)

const emailResendSchema = Joi.object(
    {
        email : Joi.string().email().required().messages({'string.email': 'Invalid email address.'}),
    }
)

const mobileResendSchema = Joi.object(
    {
        mobile : Joi.string().required(),
    }
)

const tokenSchema = Joi.object(
    {
        token : Joi.string().required()
    }
)

const passwordResendSchema = Joi.object(
    {
        coffer_id : Joi.string().required()
    }
)

const passwordVerifySchema = Joi.object(
    {
        coffer_id : Joi.string().required(),
        otp: Joi.string().length(6).required(),
        password : Joi.string().required(),
        confirm_password : Joi.string().valid(Joi.ref('password')).required().messages({'any.only': 'Passwords does not match.'})
    }
)


const registerSchema = Joi.object(
    {
        first_name : Joi.string().required(),
        last_name : Joi.string().required(),
        country : Joi.string().required(),
        email : Joi.string().email().messages({'string.email': 'Invalid email address.'}),
        mobile : Joi.string().length(10),
        password : Joi.string().required(),
        confirm_password : Joi.string().valid(Joi.ref('password')).required().messages({'any.only': 'Passwords does not match.'})
    }
).xor('email','mobile').messages({'object.missing':'Either Email OR Mobile is required.',
                                  'object.xor' :  'Please enter either an email address or a mobile number, but not both at the same time.'})
                                  .options({ stripUnknown: true });


const dob_validator = (value, helpers) => {
    const date = moment(value, "DD-MM-YYYY");

    if (!date.isValid())
        return helpers.message('Date of birth must be in the format DD-MM-YYYY.');

    if ( date.isSameOrAfter(moment(), 'day'))
        return helpers.message("Date of birth must not be in the future.");

    return value
}

const profileUpdateSchema = Joi.object(
    {
        first_name : Joi.string(),
        last_name : Joi.string(),
        middle_name : Joi.string(),
        email : Joi.string().email().messages({'string.email': 'Invalid email address.'}),
        mobile : Joi.string().length(10),
        dob : Joi.string().custom(dob_validator, 'custom dob validation'),
        old_password : Joi.string(),
        new_password : Joi.string(),
        confirm_password : Joi.string().valid(Joi.ref('new_password')).messages({'any.only': 'Passwords does not match.'})

    })
.when(Joi.object({  old_password: Joi.exist(), new_password: Joi.exist() }).unknown(), {
    then: Joi.object({
        confirm_password: Joi.required()
    }) })
    
.when(Joi.object({ old_password: Joi.exist(), confirm_password: Joi.exist() }).unknown(), {
    then: Joi.object({
        new_password: Joi.required()
    }) })

.when(Joi.object({ new_password: Joi.exist(), confirm_password: Joi.exist() }).unknown(), {
    then: Joi.object({
        old_password: Joi.required()
    }) })

.when(Joi.object({ new_password: Joi.exist() }).unknown(), {
    then: Joi.object({ old_password: Joi.required(), confirm_password: Joi.required()
    }) })

.when(Joi.object({ old_password: Joi.exist() }).unknown(), {
    then: Joi.object({ confirm_password: Joi.required(), new_password: Joi.required()
    }) })
    
.when(Joi.object({ confirm_password: Joi.exist() }).unknown(), {
    then: Joi.object({ old_password: Joi.required(), new_password: Joi.required()
    })
});

const date_validator = (value, helpers) => {
    const date = moment(value, "DD-MM-YYYY");

    if (!date.isValid())
        return helpers.message('Date must be in the format DD-MM-YYYY.');

    if ( date.isSameOrBefore(moment(), 'day'))
        return helpers.message("Target date should be a future date.");

    return value
}

const reminderSchema = Joi.object(
    {
        message: Joi.string().required(),
        target: Joi.string().required().custom(date_validator, 'custom date validation')
    }
);

const relshipRequestSchema = Joi.object({
    description: Joi.string().max(255).required().messages({
        'string.max': 'description must be 255 characters or fewer.'
    }),
    consumerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base' : 'consumerId must be a 24-character hexadecimal string.'
    })
})

const relshipAcceptSchema = Joi.object({
    response: Joi.string().valid('accept','reject').required().messages({
        'any.only': "response must be either 'accept' or 'reject'."
    }),
    reject_reason: Joi.alternatives().conditional('response',{
        is: 'reject',
        then: Joi.string().max(255).optional(),
        otherwise: Joi.forbidden()
    })
})



module.exports = {registerSchema, emailVerifySchema, emailResendSchema, mobileResendSchema, mobileVerifySchema, profileUpdateSchema,
     tokenSchema, passwordResendSchema, passwordVerifySchema, reminderSchema, relshipRequestSchema, relshipAcceptSchema }
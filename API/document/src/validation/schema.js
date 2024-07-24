const Joi = require('joi');
const moment = require('moment');

const date_validator = (value, helpers) => {
    const date = moment(value, "DD-MM-YYYY");

    if (!date.isValid())
        return helpers.message('Date must be in the format DD-MM-YYYY');

    if ( date.isSameOrBefore(moment(), 'day'))
        return helpers.message("Expiration date should be a future date");

    return value
}

const personalDocument_Post = Joi.object(
    {
        name : Joi.string().required().messages({'string.empty': 'name is required'}),
        description: Joi.string().required().messages({'string.empty': 'description is required'}),
        expiration_date: Joi.string().custom(date_validator, 'custom date validation'),
        tags: Joi.array().items(Joi.string().required())
    }
);

const personalDocument_Update = Joi.object(
    {
        name : Joi.string(),
        description: Joi.string(),
        expiration_date: Joi.string().custom(date_validator, 'custom date validation'),
        tags: Joi.array().items(Joi.string())
    }
);




module.exports = {personalDocument_Post, personalDocument_Update};
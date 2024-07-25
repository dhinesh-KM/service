const express = require('express');
const router = express.Router();
const control = require('../controller/consumer_ctrl');
const v = require('../../validation/validator');
const s = require('../../validation/schema');
const authjwt = require('../middleware/authmiddleware');
const {IsUser} = require('../middleware/permission')
const logger = require('../logger')



//Register 
router.post('/register',  v.validate_payload(s.registerSchema),  control.createUser);
router.patch('/register/:verify_type/token/:token_type',  v.types_validate,  control.registerVerify );

//Forgot password
router.patch('/forgot/:verify_type/token/send', v.forget_validator, control.forgotPswrd);
router.patch('/forgot/:verify_type/token/:token_type', v.forget_check_validator, control.forgotPswrdCheck);

router.post('/login',control.login)
router.get('/ethinicity',  control.getEthinicity);
router.get('/bloodgroup',  control.getBloodgroup);

router.use(authjwt)

//profile
router.patch('/profile/update', v.validate_payload(s.profileUpdateSchema),  control.updateUser);
router.patch('/profile/:verify_type', v.validate_payload(s.tokenSchema) ,  control.updateVerify);
router.get('/profile', control.getUser);



//Reminders
router.post('/reminders/add', v.validate_payload(s.reminderSchema), control.createReminder);
router.get('/reminders', control.getReminder);
router.delete('/reminders/:remid/delete', IsUser, control.deleteReminder);



module.exports = router 
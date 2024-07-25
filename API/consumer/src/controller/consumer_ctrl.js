const db = require('../dboperations/consumer');
const controller = require('../controller/generic_controller');


const createUser = controller.post(db.consumerCreate);

const registerVerify = controller.patch(db.consumer_Registration_Verify_Section);

const updateVerify = controller.p_patch(db.verify_email_mobile)

const getEthinicity = controller.get(db.getEthinicity);

const getBloodgroup = controller.get(db.getBloodgroup)

const updateUser = controller.patch(db.consumer_update);

const forgotPswrd = controller.patch(db.forget);

const forgotPswrdCheck = controller.patch(db.forgetCheck);

const getUser = controller.get(db.get_consumer);

const createReminder = controller.p_post((data) => db.reminder({...data, action: "create" }));

const getReminder = controller.get((data) => db.reminder({...data, action: "get" }));

const deleteReminder = controller.Delete( (data) => db.reminder({...data, action: "delete"}))


const login = controller.createLogin(db.login);




module.exports = {login, createUser, registerVerify, getEthinicity, getBloodgroup, updateUser, updateVerify, getUser, forgotPswrd, forgotPswrdCheck, createReminder, getReminder, deleteReminder}
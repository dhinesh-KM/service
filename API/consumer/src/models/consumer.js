const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const CountrySchema = new mongoose.Schema(
    {
        index : {type: String },
        country : {type: String  },
        affiliation_type : {type: String  },
        work_address : {type: String },
        home_address : {type: String  },
        mobile_phone : {type: String  },
        work_phone : {type: String },
        alt_phone : {type: String },
        affiliation_countryid : {type: String }
    }, {_id : false}
);

const ConsumerSchema = new mongoose.Schema(
    {
        coffer_id :{type: String ,unique : true},
        first_name :{type: String },
        middle_name :{type: String, },
        last_name :{type: String },
        country :{type: String },
        gender :{type: String },
        username :{type: String },
        password :{type: String },
        confirm_password :{type: String },
        password_reset_token :{type: String },
        password_reset_timestamp : { type: Date },
        password_mode :{type: String },
        joined : { type: Date },
        lastlogin : { type: Date },
        dob : { type: Date },
        email :{type: String },
        mobile :{type: String },
        email_verified : { type: Boolean, default: false},
        mobile_verified : { type: Boolean, default: false},
        email_verification_token :{type: String },
        mobile_verification_token :{type: String },
        citizen : [CountrySchema]
        //profile_completeness : { type: Number } 
        //keepass_filename 
        //ciphertext :{type: String },
        //profilepic_filename :{type: String },
        //profilepic_content_type :{type: String },
        //email_hash :{type: String },
        //mobile_hash :{type: String },
    }
);

ConsumerSchema.index({coffer_id:1});

const ReminderSchema = new mongoose.Schema(
    {
        consumer: { type: String },
        message: {type: String ,required : true},
        target : { type: Date ,required : true},
        created: { type: Date }
    }
)
//(function() {}) allows this to refer to the current document instance,

ConsumerSchema.methods.isPasswordMatch = async function (password) {
	return await bcrypt.compare(password, this.password)
}

ConsumerSchema.methods.consumer_fullname = function(){
    return this.first_name +' '+ this.last_name;
};

ConsumerSchema.methods.guid = function(){
    const email = this.email
    return email.replace(/[@.]/g,'')
}

ConsumerSchema.methods.GetConsumerData = function() {
    const d = this.dob || "";
    return {
        first_name: this.first_name,
        middle_name: this.middle_name,
        last_name: this.last_name,
        dob: d != "" ? `${d.getDate().toString().padStart(2,0)}/${(d.getMonth() + 1).toString().padStart(2,0) }/${d.getFullYear()}` : "",
        email: this.email,
        mobile: this.mobile,
        country: this.country,
        citizen: this.citizen.map(citizen => ({
            country: citizen.country,
            affiliation_type: citizen.affiliation_type,
            mobile_phone: citizen.mobile_phone || "",
            home_address: citizen.home_address || "",
            alt_phone: citizen.alt_phone || "",
            index: citizen.index,
            work_phone: citizen.work_phone || "",
            work_address: citizen.work_address || ""
        })),
        joined: this.joined,
        coffer_id: this.coffer_id,
        email_verified: this.email_verified,
        mobile_verified: this.mobile_verified,  
    };
};


const Consumer = mongoose.model('Consumer', ConsumerSchema);
const Reminder = mongoose.model('Reminder', ReminderSchema);

//const CofferAPIUser = mongoose.model('CofferAPIUser', CofferAPIUserSchema);

module.exports = {Consumer,Reminder};


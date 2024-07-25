const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {app,server} = require('../../app')
const {Consumer} = require('../../models/consumer');
const {setUp, tearDown} = require('../testSetup')



beforeAll( async() => {
    await setUp
    /*await mongoose.connection.close();
    await mongoose.connect('mongodb://localhost/TestDatabase');

    //payloads for registration
    const payload1 = {first_name: "John", last_name: "Doe", country: "USA",  email: "johndoe@example.com",
        password: "password123", confirm_password: "password123"};

    const payload2 = {first_name: "arun", last_name: "alala", country: "India",  mobile: "1234567890",
        password: "password234", confirm_password: "password234"};

    //register to get token , which will be used in verification section(why we have to do this because tokens are sent to email or mobile)
    const res1 = await request(app)
        .post("/api/v1/consumer/register")
        .send(payload1);

    const res2 = await request(app)
        .post("/api/v1/consumer/register")
        .send(payload2);

    //retrive the user
    const user1 = await Consumer.findOne({email: "johndoe@example.com"});
    const user2 = await Consumer.findOne({mobile: "1234567890"})

    //set the user's token
    token1 = user1.email_verification_token;
    token2 = user2.mobile_verification_token;

    //set cofferid's
    cofferid1 = user1.coffer_id;
    cofferid2 = user2.coffer_id;

    const jwt_Payload1 = { coffer_id: cofferid1, pk: user1._id }
    const jwt_Payload2 = { coffer_id: cofferid2, pk: user2._id }

    //token generation
    jwt_token1 = jwt.sign(jwt_Payload1, process.env.SECRETKEY)
    jwt_token2 = jwt.sign(jwt_Payload2, process.env.SECRETKEY)*/

});

afterAll(async () => {
    await tearDown
    /*await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close()*/
});


describe("Register", () => {


    describe("/register (register a user)", () => {
        it("should create a new user with valid payload", async () => {
            const validpayload ={first_name: "John", last_name: "Doe", country: "USA",  mobile: "1234567892",
                password: "000000", confirm_password: "000000"}; //email: "johndoe@example.com"

            const res = await request(app)
            .post("/api/v1/consumer/register")
            .send(validpayload)
            
            expect(res.statusCode).toEqual(201)
        })
        it("should create a new user with invalid payload", async () => {
            const invalidpayload = {first_name: "John", last_name: "", country: "USA", email: "johndoe@example.com",
                password: "password123", confirm_password: "password123"}
            const res = await request(app)
            .post("/api/v1/consumer/register")
            .send(invalidpayload)
            expect(res.statusCode).toEqual(400)
                
        })
    })

    describe("/register/:verify_type/token/:token_type (verify the registered email or mobile user)", () => {
        it("resend the token", async () => {
            const validpayload = { email:"johndoe@example.com" };
            const verify_type = "email";
            const token_type = "resend";

            const res = await request(app)
            .patch(`/api/v1/consumer/register/${verify_type}/token/${token_type}`)
            .send(validpayload)
            expect(res.statusCode).toEqual(200)
        })

        it("verify the token", async () => {
            const validpayload = { email:"johndoe@example.com", token:token1};
            const verify_type = "email";
            const token_type = "verify";

            const res = await request(app)
            .patch(`/api/v1/consumer/register/${verify_type}/token/${token_type}`)
            .send(validpayload)

            expect(res.statusCode).toEqual(200)
            expect(res.body.msg).toEqual("email verification successful.")
        })

        it("resend the mtoken", async () => {
            const validpayload = { mobile:"1234567890" };
            const verify_type = "mobile";
            const token_type = "resend";

            const res = await request(app)
            .patch(`/api/v1/consumer/register/${verify_type}/token/${token_type}`)
            .send(validpayload)

            expect(res.statusCode).toEqual(200)
        })

        it("verify the mtoken", async () => {
            const validpayload = { mobile:"1234567890", token:token2};
            const verify_type = "mobile";
            const token_type = "verify";

            const res = await request(app)
            .patch(`/api/v1/consumer/register/${verify_type}/token/${token_type}`)
            .send(validpayload)

            expect(res.statusCode).toEqual(200)
            expect(res.body.msg).toEqual("mobile verification successful.")
        })
    })
})

describe("/login", () => {
    let login_token;
    it("user authentication", async () => {
        const payload = { email: "johndoe@example.com", password: "password123", action :"login", logintype:"email"}
        const res = await request(app)
        .post("/api/v1/consumer/login")
        .send(payload)
        login_token = res.body.token
        expect(res.statusCode).toEqual(200)  
    })

    describe("update", () => {

        let updated_EmailToken1,updated_EmailToken2,updated_MobileToken1,updated_MobileToken2;

        describe("/profile/update (update details)", () => {
            it("update profile for email user", async () => {
                const validpayload = {
                    middle_name: "fricks",
                    last_name: "Daniel",
                    email: "johndoe@example.com",
                    mobile: "1234567891",
                    old_password: "password123",
                    new_password: "password000",
                    confirm_password: "password000"
                };

                const res = await request(app)
                .patch(`/api/v1/consumer/profile/update`)
                .set('Authorization', `Bearer ${login_token}`)
                .send(validpayload)
                
                const updated_user1 = await Consumer.findOne({email: "johndoe@example.com"});
                updated_EmailToken1 = updated_user1.email_verification_token
                updated_MobileToken1 = updated_user1.mobile_verification_token
                expect(res.statusCode).toEqual(200)

            })

            it("update profile for mobile user", async () => {
                const validpayload = { first_name: "arun",
                    middle_name: "sundaram",
                    email: "arun@example.com",
                    dob:"08-10-2002",
                    old_password: "password234",
                    new_password: "password111",
                    confirm_password: "password111",
                    
                };

                const res = await request(app)
                .patch(`/api/v1/consumer/profile/update`)
                .set('Authorization', `Bearer ${jwt_token2}`)
                .send(validpayload)

                const updated_user2 = await Consumer.findOne({mobile: "1234567890"});
                updated_EmailToken2 = updated_user2.email_verification_token
                updated_MobileToken2 = updated_user2.mobile_verification_token

                expect(res.statusCode).toEqual(200)

            })

            it("update profile invalid", async () => {
                const invalidpayload = { first_name: "John",
                    old_password: "password123",
                    //new_password: "password123",
                    confirm_password: "password123",
                    dob:"10-20-2000"
                };

                const res = await request(app)
                .patch(`/api/v1/consumer/profile/update`)
                .set('Authorization', `Bearer ${login_token}`)
                .send(invalidpayload)

                expect(res.statusCode).toEqual(400)
            })
        })



        describe("/profile/:verify_type (verify updated email or mobile)", () => {
            it("verify email", async () => {
                const validpayload = {token : updated_EmailToken2};
                const verify_type = "email";

                const res = await request(app)
                .patch(`/api/v1/consumer/profile/${verify_type}`)
                .set('Authorization', `Bearer ${jwt_token2}`)
                .send(validpayload)

                expect(res.body.msg).toEqual("email verification successful.")
                expect(res.statusCode).toEqual(200)


            })

            it("verify mobile", async () => {
                const validpayload = {token : updated_MobileToken1};
                const verify_type = "mobile";

                const res = await request(app)
                .patch(`/api/v1/consumer/profile/${verify_type}`)
                .set('Authorization', `Bearer ${login_token}`)
                .send(validpayload)

                expect(res.body.msg).toEqual("mobile verification successful.")
                expect(res.statusCode).toEqual(200)

            })

            it("verify false mobile", async () => {
                const validpayload = {token : updated_MobileToken1};
                const verify_type = "mobile";

                const res = await request(app)
                .patch(`/api/v1/consumer/profile/${verify_type}`)
                .set('Authorization', `Bearer ${jwt_token2}`)
                .send(validpayload)

                expect(res.body.msg).toEqual("please enter a valid token")
                expect(res.statusCode).toEqual(400)

            })
        })
    })
})

describe("/profile (specific user details)", () => {
    it("get specific user", async () => {
        
        const res = await request(app)
        .get(`/api/v1/consumer/profile`)
        .set('Authorization', `Bearer ${jwt_token1}`)

        expect(res.statusCode).toEqual(200)
        expect(res.body.data.coffer_id).toEqual(cofferid1)
    })
})
describe("Reminders", () => {

    let remid;
    describe("/reminders/add (add reminders)", () => {
        it("user create reminder", async () => {
            const validpayload = { message: "reminder 1", target: "19-06-2025" }

            const res = await request(app)
            .post("/api/v1/consumer/reminders/add")
            .set('Authorization', `Bearer ${jwt_token2}`)
            .send(validpayload)

            expect(res.statusCode).toEqual(201)
        })
    })

    describe("/reminders (get reminders)", () => {
        it("reminders for logged in user", async () => {
            const res = await request(app)
            .get(`/api/v1/consumer/reminders`)
            .set('Authorization', `Bearer ${jwt_token2}`)

            remid = res.body.data.reminder[0]._id; 

            expect(res.statusCode).toEqual(200)
            expect(typeof res.body.data.reminder).toEqual("object")
        })
    })

    describe("/reminders/:remid/delete (delete reminders)", () => {
        it("user delete reminder", async () => {
             
            const res = await request(app)
            .delete(`/api/v1/consumer/reminders/${remid}/delete`)
            .set('Authorization', `Bearer ${jwt_token2}`)

            expect(res.statusCode).toEqual(200)
        })
    })
})


module.exports = {setUp,tearDown}

//npx jest -t "reminders/add" to run specific test
//npm test to run whole test
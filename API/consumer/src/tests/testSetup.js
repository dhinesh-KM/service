const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {app,server} = require('../app')
const {Consumer} = require('../models/consumer');
const config = require('../configs/config');




const setUp = beforeAll( async() => {
    await mongoose.connection.close();
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
    jwt_token1 = jwt.sign(jwt_Payload1, config.secretKey)
    jwt_token2 = jwt.sign(jwt_Payload2, config.secretKey)

});

const tearDown = afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close()
});

module.exports = {setUp,tearDown}

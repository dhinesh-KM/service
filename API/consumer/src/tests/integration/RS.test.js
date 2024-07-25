const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const {app,server} = require('../../app')
const {Consumer} = require('../../models/consumer');
const {SpecialRelationship} = require('../../models/relationship')
const {setUp, tearDown} = require('../testSetup')

beforeAll( async() => {
    await setUp
});

afterAll(async () => {
    await tearDown
});

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

    describe("/sprelationship/search/consumer", () => {
        it("get all consumer except him", async() => {
            const res = await request(app)
            .get(`/api/v1/consumer/sprelationship/search/consumer`)
            .set('Authorization', `Bearer ${login_token}`)
            
            expect(res.statusCode).toEqual(200)
            expect(typeof res.body).toEqual("object")
        })
    })
})

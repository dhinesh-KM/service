const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const {app,server} = require('../app')
const {PersonalDocument} = require('../model')
const axios = require('axios');
const config = require('../configs/config')
const path = require('path');
const { initializeRedisClient } = require("../middleware/redis");

beforeAll( async() => {
    await mongoose.connection.close();
    await mongoose.connect('mongodb://localhost/TestDatabase');
    //payloads for registration
    const payload = {first_name: "John", last_name: "Doe", country: "USA",  email: "johndoe@example.com",
        password: "password123", confirm_password: "password123"};

    console.log(config.domain)
    login_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2ZmZXJfaWQiOiJkMTRhYzAzMTE4ZDgzMjAwIiwicGsiOiI2NjZjMTUwMmVlYWVjMGJkYzE1MTQyNWMiLCJpYXQiOjE3MjA5NTU0OTEsImV4cCI6MTcyMTA0MTg5MX0.CTrf7Lw7hPMvVg8HpKm8zmrHyZwLuxsaP3Cta7YHhIU"
    //const response = await axios.post(`${config.domain}/api/v1/consumer/register`, payload);

    //retrive the user
    //const user1 = await Consumer.findOne({email: "johndoe@example.com"});

    //console.log(response)

})

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    server.close()
    
});

/*describe("/login", () => {
    let login_token;
    it("user authentication", async () => {
        const payload = { email: "johndoe@example.com", password: "password123", action :"login", logintype:"email"}
        const res = await axios.post(`${config.domain}/api/v1/consumer/login`, payload);
        console.log(res.error)
        login_token = res.body.token
        expect(res.statusCode).toEqual(200)  
    })

    /*describe("/personal/:cat/add (add personal document)", () => {
        it
    })

})*/

describe("/personal/:cat/add", () => {
    it("user add the personal document",async () => {
        const cat = "citizen_primary"
        const filePath = path.join('C:', 'Users', 'dhine', 'Pictures', 'Screenshots', 'screenshot (7).png');
        console.log('File path:', filePath);
        const payload = {name:"all tagsss",  description:"tags check for cache",  expiration_date:"03-01-2025",
                            tags:["Health","Finance","Legal","Others","Personal"]};
        const res = await request(app)
        .post(`/api/v1/consumer/personal/${cat}/add`)
        .set('Authorization', `Bearer ${login_token}`)
        .field('name',"all tagsss")
        .field('description',"tags check for cache")
        .field('expiration_date', "03-01-2025")
        .field( 'tags', ["Health","Finance","Legal","Others","Personal"])
        /*.field('data', JSON.stringify({name:"all tagsss",  description:"tags check for cache",  expiration_date:"03-01-2025",
            tags:["Health","Finance","Legal","Others","Personal"]}))*/
        
        .attach('file',filePath)// path.join(__dirname, 'Screenshot (7).png'))
        
        console.log(res.error)

        expect(res.statusCode).toEqual(201)
    })
})

describe("/personal/:cat/:id/update" , () => {
    it("user update the personal document", async() => {
        const payload = { name:"finance", description:"prescribed medicine to improve immunity", expiration_date:"27-7-2024",
                        tags: ["Finance","Health","Legal"] }
        const cat = "citizen_primary"
        const id = "66866f362f2a5f8692cd2918"
        const res = await request(app)
        .patch(`/api/v1/consumer/personal/${cat}/${id}/update`)
        .set('Authorization', `Bearer ${login_token}`)
        .send(payload)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/:cat/:id/delete", () => {
    it("user delete the personal document", async () => {
        const cat = "citizen_primary"
        const id = "66866f362f2a5f8692cd2918"

        const res = await request(app)
        .delete(`/api/v1/consumer/personal/${cat}/${id}/delete`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/:cat/:id/view", () => {
    it("user view the personal document", async () => {
        const cat = "citizen_primary"
        const id = "66866f362f2a5f8692cd2918"

        const res = await request(app)
        .get(`/api/v1/consumer/personal/${cat}/${id}/view`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/:cat/:id/download", () => {
    it("user download the personal document", async () => {
        const cat = "citizen_primary"
        const id = "66866f362f2a5f8692cd2918"

        const res = await request(app)
        .get(`/api/v1/consumer/personal/${cat}/${id}/download`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/:cat/:id/details", () => {
    it("details of the personal document", async () => {
        const cat = "citizen_primary"
        const id = "66866f362f2a5f8692cd2918"

        const res = await request(app)
        .get(`/api/v1/consumer/personal/${cat}/${id}/details`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/:cat", () => {
    it("retrive the citizenship personal documents", async () => {
        const cat = "citizen_primary"

        const res = await request(app)
        .get(`/api/v1/consumer/personal/${cat}`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/tagged/:cat/:tag", () => {
    it("retrive the personal documents by tag", async () => {
        const cat = "citizen_primary"
        const tag = "Health"

        const res = await request(app)
        .get(`/api/v1/consumer/personal/tagged/${cat}/${tag}`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

describe("/personal/counts/:cat", () => {
    it("retrive the tag count of personal documents", async () => {
        const cat = "citizen_primary"
        
        const res = await request(app)
        .get(`/api/v1/consumer/personal/counts/${cat}`)
        .set('Authorization', `Bearer ${login_token}`)

        expect(res.statusCode).toEqual(200)
    })
})

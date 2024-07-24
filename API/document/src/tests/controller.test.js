const httpMocks = require('node-mocks-http')
const {postDocument, viewDocument, downloadDocument, updateDocument, deleteDocument, getCitzDocuments, getTagDocuments, getTagsCount} = require('../controller/document_controller')
const db = require('../dboperations');
const {app,server} = require('../app');
const jwt = require('jsonwebtoken');
const request = require("supertest")



jest.mock('../dboperations');

describe("should create a new document ", () => {
    let req, res, next;

    // Mock request and response object for each test
    beforeEach(() => {
        req = httpMocks.createRequest({
            user: { coffer_id: 'd14ac03118d83200' },
            params: { cat: 'citizen_primary'},
            body: {
                name: 'Test Document',
                expiration_date: '01-01-2025',
                description:"tags check for cache",
                tags: ["Health","Finance","Legal","Others","Personal"]
            },
            /*file: {
                fieldname: 'file',
                originalname: 'Screenshot (7).png',
                encoding: '7bit',
                mimetype: 'image/png',
                buffer: "",
                size: 189242
              }*/
        
        })

        res = httpMocks.createResponse()
        next = jest.fn()
    })

    it('/personal/:cat/add', async () => {

        // Mock db.personalDoc_Operations
        db.personalDoc_Operations.mockResolvedValue({ msg: 'Document uploaded successfully!' });
        
        // Call the controller function
        await postDocument(req,res,next);

        // Check the response
        expect(res.statusCode).toBe(201);
        expect(res._getJSONData()).toEqual({ msg: 'Document uploaded successfully!'});
      });

    })

    

describe("should view,download and get details of personal documents", () => {
    let req, res, next;

    // Mock request and response object for each test
    beforeEach(() => {
        req = httpMocks.createRequest({
            user: {coffer_id: 'd14ac03118d83200'},
            params: { cat: 'citizen_primary', id :'66824353e19fe8ca396ab52e',
                doc: {  // used view,download, delete,details
                    _id: '66824353e19fe8ca396ab52e',
                    consumer: 'd14ac03118d83200',
                    category: 'citizen_primary',
                    name: 'Health',
                    description: 'prescribed medicine to improve immunity',
                    filename: 'vadim-kaipov-f6jkAE1ZWuY-unsplash 1.jpg',
                    filesize: 3797746,
                    content_type: 'image/jpeg',
                    created: "2024-07-01T05:49:07.722Z",
                    tags: [ 'Finance', 'Health', 'Legal', 'LegalFinance' ],
                    subtags: [],
                    country: 'india',
                    expiration_date: "2024-07-27T00:00:00.000Z",
                  }
                },
            body: { name:"finance", description:"prescribed medicine to improve immunity", expiration_date:"27-7-2024",
                tags: ["Finance","Health","Legal"]}  // used by update
        
        })
        res = httpMocks.createResponse()
        next = jest.fn()
    })

    it('/personal/:cat/:id/view', async () => {
        // Mock the db operation
        const mockData = { url: 'http://firbse-url/'};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await viewDocument(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

    mockDoc = {
            view: jest.fn(),
            download: jest.fn(),
        };

    it('/personal/:cat/:id/download', async () => {
        // Mock the db operation
        const mockData = { url: 'http://firbse-url/'};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await downloadDocument(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

    it('/personal/:cat/:id/details', async () => {
        // Mock the db operation
        const mockData = { name: 'doc name' ,url: 'http://firbse-url/'};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await downloadDocument(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

    it('/personal/:cat/:id/update', async () => {
        // Mock the db operation
        const mockData = {msg: "Document updated successfully."};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await updateDocument(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

    it('/personal/:cat/:id/delete', async () => {
        // Mock the db operation
        const mockData = { msg: "Document deleted successfully."};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await deleteDocument(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

})

describe("should get citizenship, and tag specific personal documents and and their count", () => {

    // Mock request and response object for each test
    beforeEach(() => {
        req = httpMocks.createRequest({
            user: {coffer_id: 'd14ac03118d83200'},
            params: {  cat: 'citizen_primary',},
        })
        res = httpMocks.createResponse()
        next = jest.fn()
    })
    
    it('/personal/:cat', async () => {
        // Mock the db operation
        const mockData = { data : "specific citizenship docs"};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await getCitzDocuments(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

    it('/personal/tagged/:cat/:tag', async () => {
        // Mock the db operation
        const mockData = { data : "specific citizenship specific taged docs"};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await getTagDocuments(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });

    it('/personal/counts/:cat', async () => {
        // Mock the db operation
        const mockData = { data : "specific citizenship docs count"};
        db.personalDoc_Operations.mockResolvedValue(mockData);

        // Call the controller function
        await getTagsCount(req,res,next)

        // Check the response
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockData);
    });
})






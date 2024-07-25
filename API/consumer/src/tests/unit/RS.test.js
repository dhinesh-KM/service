const mongoose = require('mongoose');
const { getConsumer, sprelationship_Request_Consumer, sprelationship_Accept_Consumer, 
        getRelationships, sprelationship_TagCount, shareDocs} = require('../../dboperations/relationship');
const {Consumer} = require('../../models/consumer');
const CustomError = require('../../middleware/customerror');
const { SpecialRelationship, SharedDocument } = require('../../models/relationship');

jest.mock('../../models/Consumer');  // Mock the Consumer model
jest.mock('../../models/relationship') // Mock the SpecialRelationship model

describe('getConsumer', () => {

    it('should return consumers excluding the specified id', async () => {
        const mockConsumers = [
            { first_name: 'John', last_name: 'Doe', email: 'john@example.com', _id: new mongoose.Types.ObjectId().toString() },
            { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', _id: new mongoose.Types.ObjectId().toString() },
            { first_name: 'vijay', last_name: 'kumar', email: 'vijay@example.com', _id: new mongoose.Types.ObjectId().toString() },
        ];

        // Mock the find method to return mockConsumers
        Consumer.find.mockResolvedValue([mockConsumers[1],mockConsumers[2]]);

        const params = { cofferid: mockConsumers[0]._id};
        const result = await getConsumer(params);

        expect(result).toEqual({
            consumers: [{ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', id:  mockConsumers[1]._id },
                { firstName: 'vijay', lastName: 'kumar', email: 'vijay@example.com', id:  mockConsumers[2]._id }]
        });
    });
});

describe('relationship request consumer', () => {

    const cofferid1 = new mongoose.Types.ObjectId().toString()
    const cofferid2 = new mongoose.Types.ObjectId().toString()
    const sprid1 = new mongoose.Types.ObjectId().toString()
    const sprid2 = new mongoose.Types.ObjectId().toString()

    beforeEach(() => {
        jest.clearAllMocks();
    });
    

    it("should throw an error if acceptor is not found 1", async() => {
        const mockData = {  consumerId: cofferid1, description: 'Request description', cofferid: cofferid2 };
        Consumer.findOne.mockResolvedValueOnce({ coffer_id: cofferid1 }).mockResolvedValueOnce(null);
        await expect(sprelationship_Request_Consumer(mockData)).rejects.toThrow(new CustomError('Consumer not found', 404))
    })

    it("should throw an error if acceptor is him 1", async() => {
        const mockData = {  consumerId: cofferid2, description: 'Request description', cofferid: cofferid1 };
        Consumer.findOne.mockResolvedValueOnce({ coffer_id: cofferid1 }).mockResolvedValueOnce({ coffer_id: cofferid1  })
        await expect(sprelationship_Request_Consumer(mockData)).rejects.toThrow(new CustomError('Operation not permitted', 409))
    })

    it("should throw an error if relationship already exists from requestor 1", async() => {
        SpecialRelationship.findOne.mockResolvedValue({id: sprid1, requestor_uid: cofferid1, acceptor_uid: cofferid2})
        const mockData = {  consumerId: cofferid2, description: 'Request description', cofferid: cofferid1  };
        Consumer.findOne.mockResolvedValueOnce({ coffer_id: cofferid1 }).mockResolvedValueOnce({ coffer_id: cofferid2  })
        await expect(sprelationship_Request_Consumer(mockData)).rejects.toThrow(new CustomError('Relationship already exists', 409))
    })

    it("should throw an error if relationship already exists from acceptor 1", async() => {
        SpecialRelationship.findOne.mockResolvedValue({id: sprid1, requestor_uid: cofferid1, acceptor_uid: cofferid2})
                            .mockResolvedValue({id: sprid2, requestor_uid: cofferid2, acceptor_uid: cofferid1})
        const mockData = {  consumerId: cofferid2, description: 'Request description', cofferid: cofferid1 };
        Consumer.findOne.mockResolvedValueOnce({ coffer_id: cofferid1 }).mockResolvedValueOnce({ coffer_id: cofferid2  })
        await expect(sprelationship_Request_Consumer(mockData)).rejects.toThrow(new CustomError('Relationship already exists', 409))
    })

    it("should create a relationship 1", async() => {
        const mockData = {  consumerId: cofferid2, description: 'Request description', cofferid: cofferid1 };
        SpecialRelationship.findOne.mockResolvedValue(null)

        // Create mock instances with mocked methods
        const mockConsumer1 = new Consumer({ _id: cofferid1, first_name: 'John', last_name: 'Doe' });
        mockConsumer1.consumer_fullname = jest.fn().mockReturnValue('John Doe');

        const mockConsumer2 = new Consumer({ _id: cofferid2 });

        // Mock the findOne method to return mock instances
        Consumer.findOne
            .mockResolvedValueOnce(mockConsumer1)  
            .mockResolvedValueOnce(mockConsumer2);

        const result = await sprelationship_Request_Consumer(mockData)

        expect(result.msg).toEqual('Request sent successfully.')
    })

})

describe('relationship accept consumer', () => {
    const cofferid1 = new mongoose.Types.ObjectId().toString()
    const cofferid2 = new mongoose.Types.ObjectId().toString()
    const sprid1 = new mongoose.Types.ObjectId().toString()
    const sprid2 = new mongoose.Types.ObjectId().toString()

    beforeEach(() => {  jest.clearAllMocks();  });

    //const relid = new mongoose.Types.ObjectId().toString()

    const mockData1 = { response : "accept",  cofferid: cofferid1, params: {relid: sprid1}}
    const mockData2 = { response : "reject",  cofferid: cofferid1, params: {relid: sprid2}}

    const data = {_id: sprid1, requestor_uid : cofferid1, acceptor_uid: cofferid1, isaccepted: false}


    it('should throw an error if relationship is not found 2', async () => {
        SpecialRelationship.findById.mockResolvedValue(null)
        await expect(sprelationship_Accept_Consumer(mockData1)).rejects.toThrow(new CustomError('Relationship not found',404))
    })

    /*it('should throw an error if acceptor is him 2',async () => {
        SpecialRelationship.findById.mockResolvedValue(data)
        await expect(sprelationship_Accept_Consumer(mockData1)).rejects.toThrow(new CustomError('Operation not permitted',409))
    })*/

    it('should throw an error if relationship already accepted 2',async () => {
        data.acceptor_uid = cofferid2
        data.isaccepted = true
        SpecialRelationship.findById.mockResolvedValue(data)
        await expect(sprelationship_Accept_Consumer(mockData1)).rejects.toThrow(new CustomError('Relationship already accepted.',409))
    })

    it('should accept the relationship 2', async() => {
        data.isaccepted = false
        data.acceptor_uid = cofferid2
        data.save =  jest.fn().mockResolvedValue(true)
        SpecialRelationship.findById.mockResolvedValue(data)
        const result = await sprelationship_Accept_Consumer(mockData1)
        expect(result.msg).toEqual("Relationship status modified successfully.")
    })

    it('should reject the relationship 2', async() => {
        data.isaccepted = false
        data.acceptor_uid = cofferid2
        data.save =  jest.fn().mockResolvedValue(true)
        SpecialRelationship.findById.mockResolvedValue(data)
        const result = await sprelationship_Accept_Consumer(mockData2)
        expect(result.msg).toEqual("Relationship status modified successfully.")
    })

})

describe('get relationships /', () => {
        const cofferid1 = new mongoose.Types.ObjectId().toString()
        const cofferid2 = new mongoose.Types.ObjectId().toString()
        const cofferid3 = new mongoose.Types.ObjectId().toString()
        const sprid1 = new mongoose.Types.ObjectId().toString()
        const sprid2 = new mongoose.Types.ObjectId().toString()
        const sprid3 = new mongoose.Types.ObjectId().toString()

        const mockData1 = [
            {
                _id: sprid1,
                requestor_type : "consumer",
                requestor_uid: cofferid1,
                acceptor_type: "consumer",
                acceptor_uid: cofferid2,
                created: "2024-07-22T09:41:47.123Z",
                isaccepted: false,
                description: "please accept the request",
                status: "requested",
                requestor_group_acls: [],
                acceptor_group_acls: [],
                requestor_tags: [ "Personal" ],
                acceptor_tags: [ "Personal" ],
            }]

        const mockData2 = [ {
                _id: sprid2,
                requestor_type : "consumer",
                requestor_uid: cofferid3,
                acceptor_type: "consumer",
                acceptor_uid: cofferid1,
                created: "2024-07-22T09:41:47.123Z",
                isaccepted: true,
                description: "please accept the request",
                accepted_date: "2024-07-23T09:41:47.123Z",
                status: "accepted",
                requestor_group_acls: [],
                acceptor_group_acls: [],
                requestor_tags: [ "Personal" ],
                acceptor_tags: [ "Personal" ],
              } ]

        const resultData = [
            {
                id: sprid1,
                isSpecial: true,
                canAccept: false,
                business_name: "Boomibalagan R",
                business_category: "",
                products: [],
                description: "",
                isaccepted: false,
                isarchived: false,
                status: "requested",
                documents: {},
                profile: {},
                biztype: "consumer",
                email: "",
                mobile: "",
                guid: "boomibalagan001gmailcom",
                tags: [ "Personal" ],
                profileUrl: ""
            },
            {
                id: sprid2,
                isSpecial: true,
                canAccept: false,
                business_name: "bharathi ganesh",
                business_category: "",
                products: [],
                description: "",
                isaccepted: true,
                isarchived: false,
                status: "accepted",
                documents: {},
                profile: {},
                biztype: "consumer",
                email: "",
                mobile: "",
                guid: "bharathiganeshdigicoffercom",
                tags: [ "Personal" ],
                profileUrl: ""
            }
        ]

        const mockConsumer1 = new Consumer({ coffer_id: cofferid1, first_name: 'Boomibalagan', last_name: 'R', email: 'boomibalagan001@gmail.com' });
        mockConsumer1.consumer_fullname = jest.fn().mockReturnValue('Boomibalagan R');
        mockConsumer1.guid = jest.fn().mockReturnValue('boomibalagan001gmailcom')

        const mockConsumer2 = new Consumer({ coffer_id: cofferid2, first_name: 'bharathi', last_name: 'ganesh', email: "bharathiganesh@digicoffer.com" });
        mockConsumer2.consumer_fullname = jest.fn().mockReturnValue('bharathi ganesh');
        mockConsumer2.guid = jest.fn().mockReturnValue('bharathiganeshdigicoffercom')

        const data = {cofferid : cofferid1}

    it("should get all relationships ", async () => {
        

        Consumer.findOne.mockResolvedValueOnce(mockConsumer1).mockResolvedValueOnce(mockConsumer2)
        SpecialRelationship.find.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2)
        
        const result = await getRelationships(data)
        expect(result.data).toEqual({relationships: resultData})

    })

    it('should get relationship tag counts ', async () => {
        const result_data = [{ tagName: 'Personal', count: 2 }]
        SpecialRelationship.find.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2)

        const result = await sprelationship_TagCount(data)
        expect(result).toEqual({counts : result_data})
    })

    it('should get relationship by tag ', async () => {
        Consumer.findOne.mockResolvedValueOnce(mockConsumer1).mockResolvedValueOnce(mockConsumer2)
        SpecialRelationship.find.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2)
        data.params = { tag: "Personal" }
        const result = await getRelationships(data)
        expect(result.data).toEqual({relationships: resultData})
    })

})

describe('Documents share ', () => {
    const cofferid1 = new mongoose.Types.ObjectId().toString()

    const docid1 = new mongoose.Types.ObjectId().toString()
    const docid2 = new mongoose.Types.ObjectId().toString()

    const sprid1 = new mongoose.Types.ObjectId().toString()
    const data = { add: [ { doctype: 'identity', docid: docid1},{ doctype: 'personal', docid: docid2} ], params: {relid: sprid1}, cofferid : cofferid1}

    it('should throw an error if relationship id is not found', async () => {
        SpecialRelationship.findById.mockResolvedValue(null)
        await expect(shareDocs(data)).rejects.toThrow(new CustomError('Relationship not found',404))
    })

    it('should throw an error if any of the docid is not found :', async () => {
        SpecialRelationship.findById.mockResolvedValue({_id: sprid1})
        await expect(shareDocs(data)).rejects.toThrow(new CustomError('Document with this id not found',404))
    })

    it('should share documents with connection', async () => {
        const payload = { add: [ { doctype: 'identity', docid: docid1},{ doctype: 'personal', docid: docid2} ]}

    })
})

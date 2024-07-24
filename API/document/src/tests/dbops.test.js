const {personalDoc_Operations} = require('../dboperations');
const {PersonalDocument} = require('../model');

jest.mock('../model')

describe('personalDoc_Operations', () => {
    let params, data, mockDoc;
    let url = 'http://firebase-URL';


    beforeEach(() => {
        mockDoc = {
            view: jest.fn().mockResolvedValue(url),
            download: jest.fn().mockResolvedValue(url),
            save: jest.fn().mockResolvedValue(url)
        };

        params = {
            cat: 'citizen_primary',
            //cofferid: 'd14ac03118d83200',
            //id: '12345',
            file: {
                fieldname: 'file',
                originalname: 'Screenshot (7).png',
                encoding: '7bit',
                mimetype: 'image/png',
                buffer: "",
                size: 189242
              },
            citizen: 'some_citizen',
            doc: mockDoc
        };

        data = {name:"all tagsss",  description:"tags check for cache",  expiration_date:"03-01-2025",
            tags:["Health","Finance","Legal","Others","Personal"]};
    });

    /*it('should return the URL when action is "create"', async () => {
        params.action = 'create';

        const result = await personalDoc_Operations(params, data);
        console.log(result)
        expect(mockDoc.download).toHaveBeenCalled();
        expect(result).toEqual({ "url": mockUrl });
    });*/

    it('should create a new document', async () => {
        const mockDoc = { _id: '12345', ...params, ...data };
        PersonalDocument.create.mockResolvedValue(mockDoc);

        const result = await personalDoc_Operations(params, data);
        //console.log(result.data)
        //expect(PersonalDocument.create).toHaveBeenCalledWith({ cat: 'citizen_primary', cofferid: 'd14ac03118d83200', ...data });
        expect(result).toEqual({ msg: 'Document uploaded successfully!', newDoc: mockDoc });
    });


    it('should return the URL when action is "view"', async () => {
        params.action = 'view';

        const result = await personalDoc_Operations(params, data);

        expect(mockDoc.view).toHaveBeenCalled();
        expect(result).toEqual({ url: url });
    });

    it('should return the URL when action is "download"', async () => {
        params.action = 'download';

        const result = await personalDoc_Operations(params, data);

        expect(mockDoc.download).toHaveBeenCalled();
        expect(result).toEqual({ "url": url });
    });
});

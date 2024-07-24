const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const authjwt = require('../middleware/authmiddleware'); 
const {CustomError} = require('../middleware/customerror');


jest.mock('jsonwebtoken')

describe("authjwt middleware", () => {
    let req,res,next;

    beforeEach( () => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
    });

    it('error if the token is not  provided', async () => {
        req.header = {}
        
        await authjwt(req, res, next);
        expect(next).toHaveBeenCalledWith(new CustomError("Unauthorized", 401));
    });

    it('error if the token is invalid', async () => {
        req.header = jest.fn().mockReturnValue("invalid token");
        jwt.verify.mockImplementation( () => { throw {name : 'JsonWebTokenError'}} )

        await authjwt(req, res, next);
        expect(next).toHaveBeenCalledWith(new CustomError("Invalid token", 400));
    });

    it('error if the token is expired', async () => {
        req.header = jest.fn().mockReturnValue("expired token");
        jwt.verify.mockImplementation( () => { throw {name : 'TokenExpiredError'}} )

        await authjwt(req, res, next);
        expect(next).toHaveBeenCalledWith(new CustomError("Token Expired", 400));
    });

    it('error if the token is valid', async () => {
        const token = 'valid token';
        const decoded = { coffer_id : "1qw23e4466", pk : "66824353e19fe8ca396ab52e" };
        req.header = jest.fn().mockReturnValue(`Bearer ${token}`);
        jwt.verify.mockReturnValue( decoded )

        await authjwt(req, res, next);
        console.log(req.user)
        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(decoded)
    });
})



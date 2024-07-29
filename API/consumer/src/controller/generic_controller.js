const status = require("http-status");

const post = (method) => {
    return async (req, res, next) => {
        const data = req.body;
        if (req.user != undefined) data.cofferid = req.user.coffer_id;
        if (Object.keys(req.params).length > 0) data.params = req.params;
        try {
            const result = await method(data);
            res.status(status.CREATED).json(result);
        } catch (err) {
            next(err);
        }
    };
};

const p_post = (method) => {
    return async (req, res, next) => {
        req.body.cofferid = req.user.coffer_id;
        const data = req.body;
        try {
            const result = await method(data);
            res.status(status.CREATED).json(result);
        } catch (err) {
            next(err);
        }
    };
};

const get = (method) => {
    return async (req, res, next) => {
        console.log("-----------------", Object.keys(req.params).length);

        const data = { cofferid: req.user.coffer_id };
        if (Object.keys(req.params).length > 0) data.params = req.params;

        try {
            const result = await method(data);
            res.status(status.OK).json(result);
        } catch (err) {
            next(err);
        }
    };
};

const patch = (method) => {
    return async (req, res, next) => {
        const data = req.body;
        const params = req.params;

        try {
            const result = await method(params, data);
            res.status(status.OK).json(result);
        } catch (err) {
            next(err);
        }
    };
};

const p_patch = (method) => {
    return async (req, res, next) => {
        req.body.cofferid = req.user.coffer_id;
        const data = req.body;
        const params = req.params;

        try {
            const result = await method(params, data);
            res.status(status.OK).json(result);
        } catch (err) {
            next(err);
        }
    };
};

const Delete = (method) => {
    return async (req, res, next) => {
        req.params.cofferid = req.user.coffer_id;
        const data = req.params;

        try {
            const result = await method(data);
            res.status(status.OK).json(result);
        } catch (err) {
            next(err);
        }
    };
};

const createLogin = (method) => {
    return async (req, res, next) => {
        const data = req.body;
        try {
            const result = await method(data);
            res.status(status.OK).json(result);
        } catch (err) {
            next(err);
        }
    };
};

module.exports = { p_post, post, get, patch, p_patch, Delete, createLogin };

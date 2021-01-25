'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');
const debug = require("debug")("app:debug");
const Joi = require("@hapi/joi");

global.createSuccessResponse = (res, data, code = 200, isPaginated = false) => {
    if (isPaginated || (data?.docs)) {
        data.data = data.docs;
        delete data.docs;
        res.response = "Paginated Response";
        data.page = parseInt(data.page);
        return res.status(code).json(data);
    }
    res.response = data;
    return res.status(code).json({data});
};

global.paginatedResponse = (res, data, code = 200) => {
    data.data = data.docs;
    delete data.docs;
    res.response = "Paginated Response";
    data.page = parseInt(data.page);
    return res.status(code).json(data);
};


global.createErrorResponse = (res, error = "Oops. An Error Occurred", code = 500) => {
    console.log("Error Response", error);
    res.response = error;
    return res.status(code).json({error: error});
};

exports.handleAxiosError = error => {
    try {
        if (error && error.response) {
            return {
                status: error.response.status,
                statusText: error.response.statusText,
                message: error.response.data.error,
                url: error.response.config.url,
                params: error.response.config.params,
                data: error.response.config.data,
                headers: error.response.headers
            }
        }
        return {
            status: 500,
            statusText: error.message || "Unknown Error",
            message: error.message || "Oops, An Error Occurred",
            stack: error.stack
        }
    } catch (ex) {
        return {
            status: 500,
            statusText: "Unknown Error",
            message: "Oops, An Error Occurred",
            error: ex.message,
            stack: ex.stack
        }
    }
};

exports.generateJWT = (payload, key) => {
    console.log(payload, "key", key, "default", process.env.DEFAULT_SECURITY_KEY);
    return jwt.sign(payload, key || process.env.DEFAULT_SECURITY_KEY);
};

exports.verifyJWT = (payload, key) => {
    console.log(payload, "key", key, "default", process.env.DEFAULT_SECURITY_KEY);
    return jwt.verify(payload, key || process.env.DEFAULT_SECURITY_KEY);
};

exports.validate = (schema, payload) => {

    schema = Joi.object(schema);
    const {error, value} = schema.validate(payload, {
        allowUnknown: true,
    });

    if (error)
        return error.details[0].message.replace(/['"]/g, '');
    return null;
};

"use strict";
const debug = require("debug")("app:debug");
const {validate} = require("../helper");

const Joi = require("@hapi/joi");

const authRepository = require("../auths/AuthRepository");
exports.reset = async (req, res, next) => {
    const schema = {
        type: Joi.string().required(),
        code: Joi.string().required(),
        password: Joi.string().required()
    };

    const result = validate(schema, req.body);
    if (result)
        return createErrorResponse(res, result, 422);

    return next();
};
exports.change = async (req, res, next) => {
    const {email, phoneNumber} = req.body;
    const schema = {
        password: Joi.string().required()
    };

    const result = validate(schema, req.body);
    if (result)
        return createErrorResponse(res, result, 422);
    //
    // res.auth = await authRepository.findOne({
    //     clientId: res.clientId, $or: [{email}, {phoneNumber}]
    // });
    //
    // if (!res.auth)
    //     return createErrorResponse(res, "Account Attached to email address/phone number not found", 404);

    return next();
};

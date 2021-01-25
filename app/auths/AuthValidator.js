"use strict";
const Joi = require("@hapi/joi");
const debug = require("debug")("app:debug");

const authRepository = require("./AuthRepository");
const {validate, verifyJWT} = require("../helper");

exports.savePassword = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'] || req.body.token;
    if (!token) throw new Error("No token provided.");
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    const {userId} = await verifyJWT(token);
    debug(userId);
    if(!userId)
         throw new Error("Failed to validate provided token.");

    const schema = {
        password: Joi.string().required(),
        userId: Joi.string().required()
    };

    req.body.userId = userId;

    const result = validate(schema, req.body);
    if (result)
        return createErrorResponse(res, result, 422);

    //check if auth credentials exist
    const auth = await authRepository.findOne({userId: req.body.userId, clientId: res.clientId});
    if (!auth)
        return createErrorResponse(res, "User Not Found", 404);

    res.auth = auth;
    return next();
};


exports.login = async (req, res, next) => {
    const {email, phoneNumber} = req.body;

    const schema = {
        password: Joi.string().required()
    };

    const result = validate(schema, req.body);
    if (result)
        return createErrorResponse(res, result, 422);

    const query = {clientId: res.clientId};
    if(email) query.email = email;
    if(phoneNumber) query.phoneNumber = phoneNumber;

    res.auth = await authRepository.findOne(query);
    if (!res.auth)
        return createErrorResponse(res, "Invalid Credentials", 401);

    return next();
};
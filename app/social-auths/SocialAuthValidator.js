"use strict";
const Joi = require("@hapi/joi");
const debug = require("debug")("app:debug");
const socialInterface = require("./SocialInterface");

exports.saveCredentials = async (req, res, next) => {
    if(!socialInterface.interfaces.includes(req.params.provider))
        return createErrorResponse(res, `Provider ${req.params.provider} Not Available`, 400);

    const error = await socialInterface[req.params.provider].validateCredentials(req.body);
    if(error)
        return createErrorResponse(res, error,422);

    return next();
};

exports.getRequestUrl = async (req, res, next) => {
    res.clientId = req.headers["client_id"] || undefined;
    if(!res.clientId)
        return createErrorResponse(res, "ClientID is required", 422);


    if(!socialInterface.interfaces.includes(req.params.provider))
        return createErrorResponse(res, `Provider ${req.params.provider} Not Available`, 400);


    if(!req.query.redirectUrl)
        return createErrorResponse(res, `Redirect URL is required`, 422);

    return next();
};

exports.verifyAccess = async (req, res, next) => {
    res.clientId = req.headers["client_id"] || undefined;

    res.clientId = req.headers["client_id"] || undefined;
    if(!res.clientId)
        return createErrorResponse(res, "ClientID is required", 422);


    if(!socialInterface.interfaces.includes(req.params.provider))
        return createErrorResponse(res, `Provider ${req.params.provider} Not Available`, 400);

    const error = await socialInterface[req.params.provider].validateVerifyAccess(req.query);
    if(error)
        return createErrorResponse(res, error,422);

    return next()
};
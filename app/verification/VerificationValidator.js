"use strict";
const debug = require("debug")("app:debug");
const verifyInterface = require("./VerificationInterface");
exports.verificationTypes = ["email","phone"];

exports.verifyByType = async (req, res, next) => {
    const {type} = req.body;
    if(!verifyInterface.supportedVerificationType.includes(type))
        return createErrorResponse(res,"Invalid Verification Type", 422);

    const error = await verifyInterface[type].send.validate(req.body);
    if(error)
        return createErrorResponse(res, error, 422);

    return next();
};


exports.verifyCodeByType = async (req, res, next) => {
    const {type} = req.body;
    if(!this.verificationTypes.includes(type))
        return createErrorResponse(res,"Invalid Verification Type", 422);

    const error = await verifyInterface[type].verify.validate(req.body);
    if(error)
        return createErrorResponse(res, error, 422);

    return next();
};
"use strict";
const debug = require("debug")("app:debug");
const bcrypt = require("bcryptjs");
const {formatPhoneNumber} = require("tm-utils");

const authRepository = require("../auths/AuthRepository");

const passwordService = require("./PasswordService");
const verifyInterface = require("../verification/VerificationInterface");

exports.sendResetCode = async (req, res) => {
    let {type, value, smsProvider} = req.query;
    const payload = {
        type: type || "email",
        value,
        clientId: res.clientId,
        smsProvider
    };
    const query = {clientId: res.clientId};
    if (type == "email") query.email = value;
    if (type == "phone") query.phoneNumber = formatPhoneNumber(value, res.countryCode);

    let auth = await authRepository.findOne(query);
    if (!auth)
        return createErrorResponse(res, `Account Attached to the ${type} Not Found`, 404);

    const validationError = await verifyInterface[type].send.validate(payload);
    if (validationError)
        return createErrorResponse(res, validationError, 422);

    const {error, data} = await verifyInterface[type].send.execute({
        ...payload,
        client: res.client
    }, res.client, !auth.password ? "verification" : "password reset");
    console.log("Reset Log", error, data);
    if (error)
        return createErrorResponse(res, error);
    return createSuccessResponse(res, `A ${!auth.password ? "verification" : "password reset"} code has been sent to the email/phone number provided`);
};


exports.reset = async (req, res) => {
    let {type, value, code, password} = req.body;
    const payload = {
        value,
        code,
        clientId: res.clientId
    };
    const query = {clientId: res.clientId};
    if (type == "email") query.email = value;
    if (type == "phone") query.phoneNumber = formatPhoneNumber(value, res.countryCode);

    let auth = await authRepository.findOne(query);
    if (!auth)
        return createErrorResponse(res, `Account Attached to the ${type} Not Found`, 404);

    const validationError = await verifyInterface[type].verify.validate(payload);
    if (validationError)
        return createErrorResponse(res, validationError, 422);

    const {error, errorCode, data} = await verifyInterface[type].verify.execute(payload, res.client);
    console.log("Verify Log", error, errorCode, data);
    if(error)
        return createErrorResponse(res, error, errorCode || 500);

    auth.password = bcrypt.hashSync(password, 10);
    await auth.save();
    return createSuccessResponse(res, "Password reset successfully");
};


/**
 * Save A New password after resetting
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.change = async (req, res) => {
    let payload = req.body;
    res.user.password = bcrypt.hashSync(payload.password, 10);
    await authRepository.update({userId: res.user.userId}, {password: res.user.password});
    // audit.trail("You changed your password",
    //     "Password Changed",
    //     res.auth
    // );
    return createSuccessResponse(res, "Password Changed Successfully");
};

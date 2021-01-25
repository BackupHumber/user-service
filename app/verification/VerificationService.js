"use strict";
const verificationInterface = require("./VerificationInterface");
exports.supportedVerificationType = verificationInterface.supportedVerificationType;

exports.verify = async (verificationType, client, payload) => {
    const types = {
        phoneNumber: payload.phoneNumber,
        phone: payload.phoneNumber,
        email: payload.email,
        emailAddress: payload.email
    };


    payload.value = types[verificationType];
    const validationError = await verificationInterface[verificationType].send.validate(payload, client);
    if (validationError)
        return { error: validationError, errorCode: 422 };

    return verificationInterface[verificationType].send.execute(payload, client);
};
'use strict';
// const { check } = require('express-validator/check');
const Joi = require("@hapi/joi");
const debug = require("debug")("app:debug");
const {validate} = require("../helper");
const authRepository = require("../auths/AuthRepository");
const roleRepository = require("../roles/RoleRepository");
const profileRepository = require("./ProfileRepository");


exports.create = async (req, res, next) => {
    const {email, phoneNumber} = req.body;
    let schema = {
        clientId: Joi.required(),
        name: Joi.required(),
        email: Joi.string().email(),
        phoneNumber: Joi.string(),
        password: Joi.string(),
    };
    //verify Email
    //handle role query -  Get the role specified from the roleId or the default role
    res.role = await roleRepository.findOrReturnDefault(res.clientId, req.body.roleId);
    if (!res.role)
        return createErrorResponse(res, "Role has not been defined for this client.", 400);

    if (res.role.userRequiredFields && res.role.userRequiredFields.length > 0) {
        res.role.userRequiredFields.forEach(field => {
            schema[field] = Joi.required()
        });
    }
    const error = validate(schema, req.body);
    if (error)
        return createErrorResponse(res, error, 422);

    //check if both email and phoneNumber are empty. we need one of it
    if (!email && !phoneNumber)
        return createErrorResponse(res, "Email or Phone Number should be provided", 422);

    //check if email or phone number exists already
    if (email) {
        const emailExists = await authRepository.findOne({clientId: res.clientId, email: req.body.email});
        if (emailExists)
            return createErrorResponse(res, "Email has been taken", 422);
    }


    if (phoneNumber) {
        const phoneExists = await authRepository.findOne({clientId: res.clientId, phoneNumber: req.body.phoneNumber});
        if (phoneExists)
            return createErrorResponse(res, "Phone Number has been taken", 422);
    }


    return next();
};

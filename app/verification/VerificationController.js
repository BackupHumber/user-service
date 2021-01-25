"use strict";
const debug = require("debug")("app:debug");

const verifyInterface = require("./VerificationInterface");
const profileRepository = require("../users/ProfileRepository");
const roleRepository = require("../roles/RoleRepository");
const authService = require("../auths/AuthService");

exports.verifyByType = async (req, res) => {
    const {type} = req.body;
    const {error, errorCode, data} = await verifyInterface[type].send.execute(req.body, res.client);
    if(error)
        return createErrorResponse(res, error, errorCode || 500);
    return createSuccessResponse(res, "Verification Initiated");
};

exports.verifyCode = async (req, res) => {
    const {type} = req.body;
    let {error, errorCode, data: user} = await verifyInterface[type].verify.execute(req.body, res.client);
    if(error)
        return createErrorResponse(res, error, errorCode || 500);

    let profile = await profileRepository.findById(user.userId);
    user = user?.toJSON() || user;
    user.profile = profile.toJSON();
    if (!req.body.withToken)
        return createSuccessResponse(res, {user});

    const role = await roleRepository.findById(user.roleId);
    let {token, refresh} = await authService.generateTokens(user, res.client, role);
    return createSuccessResponse(res,  {
        user,
        token,
        refresh
    });
};
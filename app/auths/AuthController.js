"use strict";
const bcrypt = require("bcryptjs");
const debug = require("debug")("app:debug");

const { verifyJWT } = require("../helper");
const profileRepository = require("../users/ProfileRepository");
const socialAuthRepository = require("../social-auths/SocialAuthRepository");
const roleRepository = require("../roles/RoleRepository");
const authRepository = require("./AuthRepository");
const authService = require("./AuthService");
/**
 * Login
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.login = async (req, res) => {
    let payload = req.body;
    let auth = res.auth.toJSON();
    let password = res.auth.password;
    if (!password)
        return createErrorResponse(res, "Invalid Credentials", 401);

    const check = bcrypt.compareSync(payload.password, password);
    if (!check)
        return createErrorResponse(res, "Invalid Credentials", 401);

    const profile = await profileRepository.findById(auth.userId);
    auth.profile = profile.toJSON();

    const role = await roleRepository.findById(auth.roleId);
    let { token, refresh } = await authService.generateTokens(auth, res.client, role);
    auth.roleName = role?.name;

    audit.trail(res.clientId, "You signed in.",
        "Login",
        auth
    );
    return createSuccessResponse(res, { user: auth, token, refresh });
};

exports.me = async (req, res) => {
    let auth = res.user;
    if(!res?.user?.userId)
        return createErrorResponse(res, "authorization token is required", 422);
    if (res.authType == "social") {
        auth = await socialAuthRepository.findOne({ userId: res.user.userId });
        auth = auth.toJSON();
    }
    auth.profile = await profileRepository.findById(auth.userId);
    auth.roleName = await roleRepository.findById(auth.roleId).name;
    return createSuccessResponse(res, auth);
};

exports.refresh = async (req, res) => {
    let { refresh } = req.body;
    if (!refresh)
        return createErrorResponse(res, "Refresh Token Not Found", 404);
    let decoded = verifyJWT(refresh, res.client && res.client.secret);
    if (!decoded)
        return createErrorResponse(res, "Failed to authenticate token...", 401);

    let auth = await authRepository.findById(decoded.data);
    debug(decoded);
    if (!auth)
        return createErrorResponse(res, "User Not Found", 404);

    auth = auth.toJSON();
    auth.profile = await profileRepository.findById(auth.userId);
    // let payload = {userId:"1234567890"}
    let { token, refresh: newRefresh } = await authService.generateTokens(auth, res.client && res.client.secret);
    return createSuccessResponse(res, {
        user: auth,
        token,
        refresh: newRefresh
    });
};




"use strict";
const debug = require("debug")("app:debug");
const randomString = require("crypto-random-string");
const bcrypt = require("bcryptjs");

const authRepository = require("../auths/AuthRepository");
const clientRepository = require("../clients/ClientRepository");
const authService = require("../auths/AuthService");
const profileRepository = require("../users/ProfileRepository");

exports.authorize = async (req, res, next) => {
    //1. request comes with client-id, grantType, redirectUrl'
    //2. save the data on the
    const payload = req.body;
    payload.logo = res.client.logo;
    payload.name = res.client.name;
    payload.countryCode = res.client.countryCode;

    //generate code
    const code = randomString({length: 20});

    //save in cache for a minute
    const cacheResponse = await cache.setAsync(`oauth:${code}`, JSON.stringify(payload), "EX", isProduction ? 60 : 100000000);
    debug("cacheResponse", cacheResponse, code);
    const response = {
        authToken: code,
        baseURL: process.env.AUTHENTICATOR_URL,
        redirectURL: `${process.env.AUTHENTICATOR_URL}?authToken=${code}`
    };
    return createSuccessResponse(res, response);
};

exports.verifyAuthToken = async (req, res, next) => {
    let payload = await cache.getAsync(`oauth:${req.params.token}`);
    if (!payload) return createErrorResponse(res, "Session Not Found", 404);
    payload = JSON.parse(payload);
    cache.clear(`oauth:${req.params.token}`)
        .then(debug)
        .catch(debug);
    //delete auth token from cache
    return createSuccessResponse(res, payload);
};

exports.login = async (req, res, next) => {
    //login user and return temporary access token
    let payload = req.body;
    let auth = res.auth.toJSON();
    let password = res.auth.password;
    if (!password)
        return createErrorResponse(res, "Invalid Credentials", 401);

    const check = bcrypt.compareSync(payload.password, password);
    if (!check)
        return createErrorResponse(res, "Invalid Credentials", 401);

    const accessToken = randomString({length: 50});
    let oauthAccessToken = await cache.setAsync(`oauth-access-token:${accessToken}`, auth.userId, "EX", 3600);
    console.log("oauthAccessToken", oauthAccessToken);

    //save in cache as access token
    return createSuccessResponse(res, {
        accessToken,
        expiresIn: 3600
    });
};


exports.resolveAccessToken = async (req, res, next) => {
    const accessToken = req.query.accessToken;
    if(!accessToken)
        return createErrorResponse(res, "It seems this token has expired or cannot be found. Please try again");

    let userId = await cache.getAsync(`oauth-access-token:${accessToken}`);
    if(!userId)
        return createErrorResponse(res, "It seems this token has expired or cannot be found. Please try again");

    let auth = await authRepository.findOne({userId});
    if(!auth){
        console.log("Auth Not Found");
        return createErrorResponse(res, "It seems this token has expired or cannot be found. Please try again");
    }


    auth = auth.toJSON();
    auth.profile = await profileRepository.findById(userId);
    const client = await clientRepository.findById(auth.clientId);
    let {token, refresh} = await authService.generateTokens(auth, client && client.secret);
    return createSuccessResponse(res, {user: auth, token, refresh});
};

// exports.generateUs
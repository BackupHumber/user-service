"use strict";
const bcrypt = require("bcryptjs");
const debug = require("debug")("app:debug");
const moment = require("moment");
const {EVENT} = require("tm-constants");
const {formatPhoneNumber} = require("tm-utils");
const _ = require("lodash");
const randomString = require("crypto-random-string");

const profileRepository = require("./ProfileRepository");
const verificationService = require("../verification/VerificationService");
const profileService = require("./ProfileService");

const authRepository = require("../auths/AuthRepository");

const authService = require("../auths/AuthService");
const userEvents = require("../../events/UserEvent");

exports.metrics = async (req, res, next) => {
    //metric?dateTo=12-08-12&dateFrom=12-09-12&email=michealakinwonmi@gmail.com
    const {dateFrom, dateTo, ...query} = req.query;
    //query = {email: "..."}
    const totalUsersCount = await authRepository.count(query);
    let filteredUsersCount = totalUsersCount;
    if (dateFrom)
        query.createdAt = {
            $gte: moment(dateFrom, "DD-MM-YYYY").startOf("day").format("X"),
        };

    if (dateTo)
        query.createdAt = {
            ...query.createdAt,
            $lte: moment(dateTo || new Date(), "DD-MM-YYYY").endOf("day").format("X")
        };

    console.log("Query", query);

    if (query.createdAt)
        filteredUsersCount = await authRepository.count(query);

    return createSuccessResponse(res, {
        totalUsersCount,
        filteredUsersCount
    });
};
/**
 * Create User profile and its authentication details
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.create = async (req, res, next) => {
    let {
        roleId,
        name,
        clientId,
        email,
        phoneNumber,
        password,
        parentId,
        verificationType,
        changePasswordOnLogin = false,
        ...meta
    } = req.body;


    if (verificationType && !verificationService.supportedVerificationType.includes(verificationType))
        return createErrorResponse(res, "Invalid Verification Type", 422);

    let user = {
        clientId,
        name,
        meta
    };
    password = password || (changePasswordOnLogin ? randomString({length: 12}) : "");
    //create user
    user = await profileRepository.create(user);
    roleId = res.role._id.toString();
    //generate Auth
    let auth = await authRepository.create({
        userId: user._id.toString(),
        email,
        roleId,
        clientId,
        phoneNumber,
        password: bcrypt.hashSync(password, 10),
        parentId,
        meta: {
            changePasswordOnLogin
        }
    });

    auth = auth.toJSON();
    if(changePasswordOnLogin)auth.password = password;

    auth.profile = user.toJSON();
    //generate an event
    userEvents.emit(EVENT.USER.CREATED, auth);
    //generate token
    let {token, refresh} = await authService.generateTokens(auth, res.client, res.role);
    if (!verificationType)
        return createSuccessResponse(res, {
            verification: false,
            user: auth,
            token,
            refresh
        }, 201);

    const {error, data} = await verificationService.verify(verificationType, res.client, req.body);
    debug("Verification Log", error, data);
    return createSuccessResponse(res, {
        verification: !error,
        user: auth,
        token,
        refresh
    }, 201);

};


/**
 * Fetch All User.
 * Permission: Admin Only
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.fetchAll = async (req, res, next) => {
    let {page, limit, countryCode, ...query} = req.query;
    page = page || 1;
    limit = limit || 100;
    //search from ES and order by createdAt

    const {error, data: userIds, total} = await profileService.searchUsingElasticsearch(query, {page, limit});
    if(error || userIds?.length == 0) return createSuccessResponse(res, { total: 0, page, pages: 0, limit, docs: []});

    let auths = await authRepository.all({userId: {$in: userIds}}, {_id: -1}, page, limit);
    const profiles = await profileRepository.all({_id: {$in: userIds}});
    if (profiles.length == 0)
        return createSuccessResponse(res, {
            total: 0,
            page,
            pages: 0,
            limit,
            docs: []
        });


    const formattedProfileDetails = [];
    for (let profile of profiles) {
        formattedProfileDetails[profile._id] = profile.toJSON();
    }

    auths.docs = auths.docs.map(auth => {
        auth = auth.toJSON();
        auth.profile = formattedProfileDetails[auth.userId];
        return auth;
    }).filter(Boolean);
    console.log("Length", auths.docs.length);
    auths.total = total;
    auths.pages = Math.ceil(total/limit);
    return createSuccessResponse(res, auths);
};

exports.check = async (req, res, next) => {
    const {phoneNumber, clientId} = req.query;
    const checks = {
        exists: false,
        phoneNumberVerified: false,
        emailVerified: false
    };
    const user = await authRepository.findOne({clientId, phoneNumber});
    if (!user)
        return createSuccessResponse(res, checks);


    checks.exists = true;
    checks.emailVerified = !!user.emailVerifiedAt;
    checks.phoneNumberVerified = !!user.phoneNumberVerifiedAt;
    return createSuccessResponse(res, checks);
};

exports.findOne = async (req, res, next) => {
    //TODO make this a general rule
    if (!res.allowPass && res.user.userId != req.params.id)
        return createErrorResponse(res, "Unauthorized", 401);

    let user;
    if ((res.user && res.user.userId) == req.params.id) user = res.user;
    else {
        user = await authRepository.findOne({userId: req.params.id});
        if (!user)
            return createErrorResponse(res, "We could not find this user on this platform.", 404);

        user = user.toJSON();
    }
    user.profile = await profileRepository.findById(user.userId);
    console.log("Profile", user);
    return createSuccessResponse(res, user);
};

exports.findOrCreate = async (req, res, next) => {
    let {type, value} = req.params;
    const clientId = res.clientId;
    if(!verificationService.supportedVerificationType.includes(type))
        return createErrorResponse(res, "Invalid Type. [email, phone] are supported", 422);

    const phoneType = ["phone","phoneNumber", "phone-number"];
    if(phoneType.includes(type)){
        value = formatPhoneNumber(value);
        type = "phoneNumber";
    }

    let auth = await authRepository.findOne({clientId, [type]: value});
    // let auth = await authRepository.findOne({clientId, type: value});
    if(auth){
        auth = auth.toJSON();
        auth.profile = await profileRepository.findById(auth.userId);
        return createSuccessResponse(res, auth);
    }

    console.log("============== Creating User =================");
    const {error, data, errorCode} = await profileService.createUser({
        clientId,
        [type]: value,
        ...req.body
    });

    console.log("Creating User Response", data, "Error", error);
    if(error)
        return createErrorResponse(res, error, errorCode || 500);
    return createSuccessResponse(res, data, 201);
};

/**
 * Update a user
 * Permission: Admin Role can update all user that falls under the same clientId,
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.update = async (req, res, next) => {
    let payload = req.body;
    let user = await authRepository.findOne({userId: req.params.id});
    let profile = await profileRepository.findOne({_id: req.params.id});
    if (!user)
        return createErrorResponse(res, "User Not Found", 404);
    //update auth

    let userUpdate = {
        meta: profile.meta || {}
    };

    const meta = profile.meta || {};
    // const meta
    let authDetails = authRepository.getFillable();
    let nonMetaInfo = profileRepository.nonMetaFields();
    let nonUpdateField = profileRepository.nonUpdateField();

    for (let key in payload) {
        if (!payload.hasOwnProperty(key))
            continue;

        //check if its a auth detail
        if (authDetails.includes(key)) {
            user[key] = payload[key];
            continue;
        }

        //check if its a user non meta details
        if (nonMetaInfo.includes(key)) {
            profile[key] = payload[key];
            continue;
        }

        //check if its not in an non update field
        if (nonUpdateField.includes(key))
            continue;

        meta[key] = payload[key];
    }

    // console.log("Profile", profile.meta);
    profile.meta = meta;
    //update both user and profile
    // await profile.save();
    // await user.save();
    await authRepository.update({userId: req.params.id}, user);
    await profileRepository.update({_id: req.params.id}, profile);

    user = user.toJSON();
    user.profile = profile;
    userEvents.emit(EVENT.USER.UPDATED, user);
    return createSuccessResponse(res, user);
};


exports.revoke = async (req, res, next) => {
    let user = await authRepository.findOne({userId: req.params.id});
    user.meta = {
        ...user.meta,
        revoked: true
    };
    await user.save();
    return createSuccessResponse(res, user);
};


exports.grant = async (req, res, next) => {
    let user = await authRepository.findOne({userId: req.params.id});
    user.meta = {
        ...user.meta,
        revoked: false
    };
    await user.save();
    return createSuccessResponse(res, user);
};

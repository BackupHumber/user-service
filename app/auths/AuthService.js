"use strict";
const cron = require("node-cron");
const cryptoRandomString = require('crypto-random-string');
const moment = require("moment");
const {cloneDeep} = require("lodash");
const {SECURITY} = require("tm-constants");
const {generateJWT} = require("../helper");

const roleRepository = require("../roles/RoleRepository");
exports.registerAuthCronJob = async () => {
    console.log("Registering Auth Crons");
    const secToken = await cache.getAsync(SECURITY.INTERNAL_SECURITY_TOKEN);
    console.log("Security", secToken);
    if (!secToken) {
        const token = cryptoRandomString({length: 100, type: "url-safe"});
        const cacheResponse = await cache.setAsync(SECURITY.INTERNAL_SECURITY_TOKEN, token);
        console.log("Sec Token in cache", token, "cache response", cacheResponse);
    }

    // await cache.setAsync(SECURITY.INTERNAL_SECURITY_TOKEN, cryptoRandomString({length: 200, type: "url-safe"}));

    // cron.schedule("0 * * * *", async () => {
    //     console.log("Updating Security Token");
    //     await cache.setAsync(SECURITY.INTERNAL_SECURITY_TOKEN, cryptoRandomString({length: 200, type: "url-safe"}));
    // },{});
};


exports.generateTokens = async (auth, client, role, type = "auth") => {
    role = role || await roleRepository.findById(auth.roleId);
    const authData = cloneDeep(auth);
    delete authData.profile.meta;
    delete authData.roleId;
    const secret = client?.secret || process.env.DEFAULT_SECURITY_KEY;
    let token = generateJWT({
        auth: authData,
        type,
        clientId: auth.clientId,
        permissions: role?.permissions || [],
        authorisedService: client?.allowedServices || [],
        exp: parseInt(moment().utc().add(12, "hour").format("X")), data: auth.id

    }, secret);

    const refreshExpiry = moment().utc().add(3, "day").format("X");
    let refresh = generateJWT({
        exp: parseInt(refreshExpiry), data: auth.id, type,
    }, secret);

    return {
        token,
        refresh
    }
};
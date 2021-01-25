"use strict";
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const RedisStore = require('rate-limit-redis');

//get controller
const verificationController = require("../../app/verification/VerificationController");
const verificationValidator = require("../../app/verification/VerificationValidator");


console.log("Cache", cache);
const apiLimiter = rateLimit({
    store: new RedisStore({
        client: cache
    }),
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    message: {error: "Resource has been accessed too many times. Please try again after 30 minutes."},
    keyGenerator: function (req /*, res*/) {
        console.log("${req.ip}:${req.baseUrl}",`${req.ip}:${req.originalUrl}`,`${req.headers["x-real-ip"]}:${req.originalUrl}`);
        return `${req.headers["x-real-ip"]}:${req.originalUrl}`;
    }
});
//router.use(apiLimiter);
router.post("/", verificationValidator.verifyByType, verificationController.verifyByType);
router.post("/code", verificationValidator.verifyCodeByType, verificationController.verifyCode);

module.exports = router;

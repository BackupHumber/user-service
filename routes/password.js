"use strict";
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const RedisStore = require('rate-limit-redis');

const {getClientCredentials, authenticate} = require("../app/Middleware");

//get controller
const passwordController = require("../app/passwords/PasswordController");
const passwordValidator = require("../app/passwords/PasswordValidator");


const apiLimiter = rateLimit({
    store: new RedisStore({
        client: cache
    }),
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    message: {error: "Resource has been accessed too many times. Please try again after 30 minutes."},
    keyGenerator: function (req /*, res*/) {
        console.log("${req.ip}:${req.baseUrl}",`${req.ip}:${req.originalUrl}`);
        return `${req.headers["x-real-ip"]}:${req.originalUrl}`;
    }
});
router.use(getClientCredentials, apiLimiter);
router.get("/reset", passwordController.sendResetCode);
router.post("/reset", passwordValidator.reset, passwordController.reset);
router.post("/change", authenticate, passwordValidator.change, passwordController.change);
module.exports = router;

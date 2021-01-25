"use strict";
const router = require("express").Router();
const {authenticate, authorize, getClientCredentials} = require("../app/Middleware");
const {ROLE_ADMIN} = require("../app/Constants");
const verifyRouter = require("./auth/verify");
//get controller
const authController = require("../app/auths/AuthController");
const authValidator = require("../app/auths/AuthValidator");

const socialAuthController = require("../app/social-auths/SocialAuthController");
const socialAuthValidator = require("../app/social-auths/SocialAuthValidator");



router.use("/verify", verifyRouter);

router.post("/login", getClientCredentials, authValidator.login, authController.login);
// router.post("/login/:type", getClientCredentials, authController.loginWithType);
router.post("/token/refresh", getClientCredentials, authController.refresh);

router.get("/me", getClientCredentials, authenticate, authController.me);

router.post("/social/:provider/credentials",
    getClientCredentials,
    authenticate,
    socialAuthValidator.saveCredentials,
    socialAuthController.saveCredentials
);
router.get("/social/:provider/request-url",
    getClientCredentials,
    socialAuthValidator.getRequestUrl,
    socialAuthController.getRequestUrl
);

router.get("/social/:provider/verify-access",
    getClientCredentials,
    socialAuthValidator.verifyAccess,
    socialAuthController.verifyAccess
);
module.exports = router;

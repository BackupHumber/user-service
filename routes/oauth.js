"use strict";
const router = require("express").Router();
const {authenticate, authorize, getClientCredentials} = require("../app/Middleware");
const {ROLE_ADMIN} = require("../app/Constants");
//get controller
const oauthController = require("../app/oauths/OauthController");
const oauthValidator = require("../app/oauths/OauthValidator");
const authValidator = require("../app/auths/AuthValidator");

router.post("/initialize", getClientCredentials, oauthValidator.authorize, oauthController.authorize);
// router.post("/authorize", getClientCredentials, oauthValidator.authorize, oauthController.authorize);
router.post("/authorize", getClientCredentials, authValidator.login, oauthController.login);
router.get("/resolve-access-token", oauthController.resolveAccessToken);
router.get("/:token", oauthController.verifyAuthToken);
module.exports = router;
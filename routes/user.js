const express = require("express");
const router = express.Router();


//get controller
const userController = require("../app/users/UserController");
const userValidator = require("../app/users/UserValidator");
const {authenticate, getClientCredentials, authorize, can} =  require("../app/Middleware");
// const {ROLE_ADMIN, ROLE_USER} = require("../app/Constants");


router.use(getClientCredentials);

router.get("/check", userController.check);

router.post("/", userValidator.create, userController.create);

router.get("/", authenticate, userController.fetchAll);

router.get("/metrics", authenticate, can("fetch-all-users"), userController.metrics);

router.get("/:id", authenticate, can("fetch-user"), userController.findOne);

router.put("/:id", authenticate, can("update-user"), userController.update);

router.patch("/:id/revoke", authenticate, can("grant-revoke-user-access"), userController.revoke);

router.patch("/:id/grant", authenticate, can("grant-revoke-user-access"), userController.revoke);

router.post("/:type/:value", userController.findOrCreate);

module.exports = router;

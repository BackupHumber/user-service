"use strict";
const express = require("express");
const router = express.Router();
const { authenticate, getClientCredentials, authorize, can } = require("../app/Middleware");
const { ROLE_ADMIN, ROLE_USER } = require("../app/Constants");

//get controller
const roleController = require("../app/roles/RoleController");
const roleValidator = require("../app/roles/RoleValidator");

router.use(getClientCredentials);
router.get("/", roleController.fetch);
router.get("/:roleId", roleController.find);

router.use(authenticate);
router.post("/create", can("create-role"), roleValidator.create, roleController.create);
router.post("/", can("create-role"), roleValidator.create, roleController.create);
router.put("/:roleId", can("update-role"), roleValidator.update, roleController.update);

module.exports = router;


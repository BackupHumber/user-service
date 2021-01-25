"use strict";
const express = require("express");
const router = express.Router();

//get controller
const permissionController = require("../app/permissions/PermissionController");
const permissionValidator = require("../app/permissions/PermissionValidator");
const {getClientCredentials} = require("../app/Middleware");

router.put("/components", permissionValidator.save, permissionController.save);
router.get("/components", permissionController.fetchComponents);
router.use(getClientCredentials);
router.get("/", permissionController.fetch);

module.exports = router;


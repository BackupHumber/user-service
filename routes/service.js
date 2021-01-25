"use strict";
const express = require("express");
const router = express.Router();
// const {authenticate} = require("../app/Middleware");

//get controller
const serviceController = require("../app/services/ServiceController");

// router.use(authenticate);
router.get("/", serviceController.list);
// router.patch("/",auditController.updateReadStatus);

module.exports = router;
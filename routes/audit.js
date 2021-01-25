"use strict";
const express = require("express");
const router = express.Router();
const {authenticate} = require("../app/Middleware");

//get controller
const auditController = require("../app/audits/AuditController");

router.use(authenticate);
router.get("/",auditController.get);
router.patch("/",auditController.updateReadStatus);

module.exports = router;
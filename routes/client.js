const router = require("express").Router();
const {authenticate,getClientCredentials, onlyMaster} = require("../app/Middleware");

//get controller
const clientController = require("../app/clients/ClientController");
const clientValidator = require("../app/clients/ClientValidator");




//
// router.post("/password/create", decodeHeader, authValidator.savePassword, authController.savePassword);
// router.post("/token/refresh", authController.refresh);
// router.get("/verification/email/resend", authController.resendVerificationEmail);
// router.get("/reset/password",authController.reset);

// router.use(getClientCredentials);
router.post("/", authenticate, clientValidator.create, clientController.create);
router.post("/create", authenticate, clientValidator.create, clientController.create);
router.get("/", authenticate, onlyMaster, clientController.fetch);

router.put("/:clientId", authenticate, clientController.update);
router.get("/fetch", onlyMaster, clientController.fetch);

module.exports = router;
'use strict';

require("express-async-errors");
const home = require("./home");

const {getClientCredentials} = require("../app/Middleware");


module.exports = (app) => {
    app.use("/", home);
    app.use("/health-check", require("../app/AppController").healthCheck);
    app.use("/v1/permissions/", require("./permission"));
    app.use(getClientCredentials);


    app.use("/v1/services/", require("./service"));
    app.use("/v1/clients/", require("./client"));
    app.use("/v1/roles/", require("./role"));
    app.use("/v1/auths/", require("./auth"));
    app.use("/v1/oauths/", require("./oauth"));
    app.use("/v1/users/", require("./user"));
    app.use("/v1/passwords/", require("./password"));

};

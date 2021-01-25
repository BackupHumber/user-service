"use strict";
const AuditService = require("audit-service");

module.exports = (app, express) => {
    require("tm-redis");

    global.audit = new AuditService();
    audit.init()
        .catch(console.log);

    //logger
    require("tm-utils/src/logging");


//Queue
    require("./queue");

//middleware
    require("./middleware")(app, express);

//database connection
    require("./database");

    // if (process.env.NODE_ENV != "development")
    //     require("./seeder");
};

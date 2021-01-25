"use strict";
module.exports = {
    ROLE_ADMIN: "admin",
    ROLE_USER: "user",

    PAYOUT_PERIOD_KEY: "PAYOUT_DAY",




    CLIENT_DEFAULT: "default",
    SECRET_DEFAULT: "default",
    INTERNAL_SECURITY_TOKEN: "INTERNAL_SECURITY_TOKEN",
    CACHE_KEY: {
        CLIENTS: "clients"
    },
    ES_INDEX:{
        USERS: `users_${process.env.NODE_ENV}`
    },
    EMITTERS: {
        CLIENT: {
            CREATED: "CLIENT_CREATED"
        }
    }

};

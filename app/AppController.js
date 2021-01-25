"use strict";
const authRepository = require("./auths/AuthRepository");
exports.healthCheck = async (req, res, next) => {
    try{

        //1. Check DB
        //2. Check Redis
        //3. Check Queue

        const healthCheck = {
            uptime: process.uptime(),
            cache: false,
            database: false,
            queue: false,
            timestamp: Date.now()
        };

        //DB
        await authRepository.findOne({}, {_id: -1});
        healthCheck.database = true;

        //Cache
        await cache.setAsync("ping", "ping");
        healthCheck.cache = true;

        //Queue
        await Queue.publish("health.check", "", {userService: true});
        healthCheck.queue = true;


        //Redis Check


        return createSuccessResponse(res, healthCheck);
    }catch (e) {
        return createErrorResponse(res, e.message);
    }
};

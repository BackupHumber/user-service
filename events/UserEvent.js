"use strict";
const debug = require("debug")("app:debug");
const {EmailBuilder} = require("tm-notification");
const Emitter = require("events").EventEmitter;
const listener = new Emitter;
const _ = require("lodash");
const {EVENT} = require("tm-constants");

const userService = require("../app/users/ProfileService");

listener.on(EVENT.USER.CREATED, async (user) => {
    const eventPayload = {
        clientId: user.clientId,
        event: "user.created",
        data: user
    };
    console.log("USER CREATED EVENT GENERATED", JSON.stringify(eventPayload));
    //generate a rabbitMQ event
    setImmediate(() => {
        const response = Queue.publish(EVENT.USER.CREATED, "", eventPayload);
        debug("===========Rabbit USER Event Published==================", response);
    });

    //Create Audit trail
    setImmediate(async () => {
        //audit trail
        audit.trail(user.clientId, "You created an account",
            "Sign up",
            user
        );
        debug("===========Audit Trail(Create User) ==================");
    });


    setImmediate(() => {
        const profile = {...user.profile};
        const meta = {...profile.meta};
        delete user.profile;
        delete profile.meta;
       userService.save({
           ...meta,
           ...user,
           ...profile
       }).catch(debug)
           .then(debug);
    });
    //spool a copy to
});

listener.on(EVENT.USER.UPDATED, async user => {
   setImmediate(() => {
       debug("==================Updating Cache===============");
       const profile = {...user.profile};
       const meta = {...profile.meta};
       delete user.profile;
       delete profile.meta;
       userService.save({
           ...meta,
           ...user,
           ...profile
       }, "update").catch(debug)
           .then(debug);
   })
});

console.log("============= User Events Loaded ===============");

global.userEvents = listener;
module.exports = listener;

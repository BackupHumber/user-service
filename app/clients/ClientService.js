"use strict";
const {CACHE_KEY} = require("../Constants");

exports.putClientInCache = (client) => {
    console.log("Client", client);
    cache.hsetAsync(CACHE_KEY.CLIENTS, client.clientId, JSON.stringify(client))
        .then(console.log)
        .catch(console.log);
};
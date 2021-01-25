"use strict";
const Client = require('./ClientModel');
const Repository = require("../MongoDBRepository");
const cryptoRandomString = require('crypto-random-string');

const {CACHE_KEY} = require("../Constants");
const match = {
    development: "local_",
    staging: "test_",
    production: "live_"
};

class ProfileRepository extends Repository{
    constructor(){
        super(Client);
    }

    getNonMetaFields(){
        return ["name","logo", "appURL","email","allowedServices", "clientId","secret","access", "countryCode"];
    }
    async generateClientId(){
        let clientId = (match[process.env.NODE_ENV] || "test") + cryptoRandomString({length: 20});
        const check = await this.findOne({clientId});
        if(!check)
            return clientId;
        return await this.generateClientId();
    }

    async findById(id) {
        let client = await cache.hgetAsync(CACHE_KEY.CLIENTS, id);
        if(client && client[0])
            return JSON.parse(client);

        client = await this.findOne({clientId: id});
        if(client){
            client = client?.toJSON() || client;
            cache.hsetAsync(CACHE_KEY.CLIENTS, id, JSON.stringify(client));
        }
        return client;
    }

    async generateSecret(){
        return (match[process.env.NODE_ENV] || "test") + cryptoRandomString({length: 20});
    }
}
module.exports = (new ProfileRepository());
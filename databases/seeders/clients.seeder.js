"use strict";
const cache = require("tm-redis");
const {Seeder} = require('mongoose-data-seed');

const clientRepository = require("../../app/clients/ClientRepository");
const {CACHE_KEY} = require("../../app/Constants");

const data = [{}];

class ClientsSeeder extends Seeder {

    async shouldRun() {
        return true;
    }

    async run() {
        return Promise.all((await clientRepository.all()).map(async client => {
            return await cache.hsetAsync(CACHE_KEY.CLIENTS, client.clientId, JSON.stringify(client));
        }));
    }
}

module.exports = ClientsSeeder;

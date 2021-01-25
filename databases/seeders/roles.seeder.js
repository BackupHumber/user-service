"use strict";
const {Seeder} = require('mongoose-data-seed');
const roleRepository = require("../../app/roles/RoleRepository");

const clientId = "default";

class RolesSeeder extends Seeder {

    async shouldRun() {
        return true;
        return roleRepository.findOne({clientId}).then(role => !role);
    }

    async run() {
        await roleRepository.deleteMany({clientId});
        return roleRepository.massInsert([
                {
                    clientId,
                    name: "admin",
                    permissions: [] //empty means all privilege
                },
                {
                    clientId,
                    name: "user",
                    isDefault: true,
                    permissions: [{
                        key: "fetch-user",
                        owner: true,
                    }, {
                        key: "update-user",
                        owner: true,
                    }, {
                        key: "delete-user",
                        owner: true
                    }]
                }
            ]
        );
    }
}

module.exports = RolesSeeder;

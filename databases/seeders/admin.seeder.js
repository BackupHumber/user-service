"use strict";
const {Seeder} = require('mongoose-data-seed');
const bcrypt = require("bcryptjs");
const roleRepository = require("../../app/roles/RoleRepository");
const profileRepository = require("../../app/users/ProfileRepository");
const authRepository = require("../../app/auths/AuthRepository");

const clientId = "default";
const email = "admin@user-service.com";
const name = "Admin User-service";
const data = [{}];

class AdminSeeder extends Seeder {

    async shouldRun() {
      await authRepository.deleteMany({clientId, email});
      await profileRepository.deleteMany({clientId, name});
        return true;
        // return authRepository.findOne({clientId, email}).then(auth => !auth);
    }

    async run() {
        let role = "admin";
        //check roles
        let adminRole = await roleRepository.findOne({name: role});
        if (!adminRole)
            throw new Error("Admin Role Not Found");

        let adminUser = await profileRepository.create({
            clientId,
            name,
        });

        // let adminUser = await profileRepository.findOne({
        //     clientId,
        //     name
        // });
        console.log("adminUser", adminUser);
        return authRepository.create({
            userId: adminUser._id.toString(),
            clientId,
            roleId: adminRole._id.toString(),
            email,
            password: bcrypt.hashSync("admin", 10),
        });

    }
}

module.exports = AdminSeeder;

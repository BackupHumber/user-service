"use strict";
const {Seeder} = require('mongoose-data-seed');
const roleRepository = require("../../app/roles/RoleRepository");
const permissionRepository = require("../../app/roles/permissions/PermissionRepository");

class PermissionsSeeder extends Seeder {

    async shouldRun() {
        // await permissionRepository.deleteMany({});
        return true;
    }

    async run() {
        const data = [];
        //get all roles
        for(let role of await roleRepository.all()){
            if(!role.permissions || role.permissions.length == 0)
                continue;

            const roleId = role._id.toString();
            const timestamp = new Date();
            role.permissions.forEach(permission => {
                if((typeof permission).toLowerCase() == "string"){
                    data.push({
                        key: permission,
                        owner: false,
                        clientId: role.clientId,
                        roleId: roleId,
                        createdAt: timestamp,
                        updatedAt: timestamp
                    })
                }else{
                    data.push({
                        key: permission.key,
                        owner: permission.owner,
                        clientId: role.clientId,
                        roleId: roleId,
                        createdAt: timestamp,
                        updatedAt: timestamp
                    })
                }

            });
            role.permissions = [];
            role.save();
        }
        return permissionRepository.massInsert(data);
    }
}

module.exports = PermissionsSeeder;

"use strict";
const permissionRepository = require("./PermissionRepository");
exports.updatePermissions = async (role, permissions) => {

    if(!permissions) return permissions;

    await permissionRepository.deleteMany({clientId: role.clientId, roleId: role.id});
    //Create Permissions
    if(permissions.length == 0)
        return permissions;


    const timestamp = new Date();

    permissions = permissions.map(permission => {
        permission.roleId = role.id;
        permission.clientId = role.clientId;
        permission.createdAt = permission.updatedAt = timestamp;
        return permission;
    });
    await permissionRepository.massInsert(permissions);

    return permissions;
};

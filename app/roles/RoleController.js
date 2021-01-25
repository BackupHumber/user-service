"use strict";
const debug = require("debug")("app:debug");
const roleRepository = require("./RoleRepository");
const rolePermissionService = require("./permissions/PermissionService");
const rolePermissionRepository = require("./permissions/PermissionRepository");
const roleComponentRepository = require("./components/ComponentRepository");
const roleComponentService = require("./components/ComponentService");
// const {createSuccessResponse, createErrorResponse} = require("../helper");

exports.create = async (req, res) => {
    let {permissions, components, ...payload} = req.body;
    payload.createdBy = res.user.userId;
    //create role, check if there is a default and update it not to be default anymore
    if (payload.isDefault) await roleRepository.update({clientId: res.clientId}, {isDefault: false});
    let role = await roleRepository.create(payload);
    role = role.toJSON();
    role.permissions = await rolePermissionService.updatePermissions(role, permissions);
    role.components = await roleComponentService.updateComponents(role, components);
    audit.trail(res.clientId, `You created a role (${role.name})`,
        "role created",
        res.user || {}
    );
    return createSuccessResponse(res, role, 201);
};

exports.update = async (req, res) => {
    const {permissions, components, ...payload} = req.body;
    if(payload.isDefault) await roleRepository.update({clientId: res.clientId}, {isDefault: false});
    await res.role.update(payload);

    rolePermissionService.updatePermissions(res.role, permissions)
        .catch(console.log);

    roleComponentService.updateComponents(res.role, components)
        .catch(console.log);

    audit.trail(res.clientId, `You Updated a role (${res.role.name})`,
        "role updated",
        res.user || {}
    );
    return createSuccessResponse(res, "Role Updated", 202);
};

exports.fetch = async (req, res) => {
    const roles = await roleRepository.all({ clientId: res.clientId }, {_id: -1}, null, null);
    return createSuccessResponse(res, roles);
};

exports.find = async (req, res) => {
    const { roleId } = req.params;
    let role = await roleRepository.findOne({ _id: roleId, clientId: res.clientId }, {_id: -1});
    if (!role) return createErrorResponse(res, 'Oops, We could not found the role you were looking for. Please try again', 404);

    role = role.toJSON();
    role.permissions = await rolePermissionRepository.all({roleId, clientId: res.clientId});
    role.components = await roleComponentRepository.all({roleId, clientId: res.clientId});
    return createSuccessResponse(res, role);
};


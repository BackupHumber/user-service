"use strict";
const {groupBy} = require("lodash");
const permissionService = require("./PermissionService");
const componentRepository = require("./ComponentRepository");
exports.fetch = async (req, res, next) => {
    //return list of permissions
    console.log("Repo", res.client);
    // const query = {};
    // const allowedServices = res.client?.allowedService || [];
    //
    // if(allowedServices.length > 0)
    //     query.service = {$in: allowedServices};

    // const permissions = await permissionRepository.all(query);
    const permissions = await permissionService.getPermissions();
    if(req.query.groupBy)
        return createSuccessResponse(res,groupBy(permissions, req.query.groupBy));

    return createSuccessResponse(res, permissions);
};


exports.save = async (req, res, next) => {
    const {components} = req.body;
    await componentRepository.deleteMany({});
    await componentRepository.massInsert(components.map(component => {
        return {
            name: component
        }
    }));
    return createSuccessResponse(res, "Components Saved", 201);
};

exports.fetchComponents = async (req, res, next) => {
    return createSuccessResponse(res, await componentRepository.all(), 201);
};




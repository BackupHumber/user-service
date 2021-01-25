"use strict";
const componentRepository = require("./ComponentRepository");
exports.updateComponents = async (role, components) => {

    if(!components) return components;

    await componentRepository.deleteMany({clientId: role.clientId, roleId: role.id});
    //Create Permissions
    if(components.length == 0)
        return components;


    const timestamp = new Date();

    components = components.map(component => {
        component.roleId = role.id;
        component.clientId = role.clientId;
        component.createdAt = component.updatedAt = timestamp;
        return component;
    });
    await componentRepository.massInsert(components);
    return components;
};

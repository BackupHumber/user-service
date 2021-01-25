"use strict";
const Joi = require("@hapi/joi");
const roleRepository = require("./RoleRepository");
const debug = require("debug")("app:debug");
const {validate} =  require("../helper");
exports.create = async (req, res, next) => {
    const schema = {
        name: Joi.string().required(),
        permissions: Joi.array().items(Joi.object().keys({
            key: Joi.string().required().label("One or more permission key"),
            owner: Joi.boolean()
        })),
        components: Joi.array().items(Joi.object().keys({
            key: Joi.string().required().label("One or more component key")
        }))
    };
    const result = validate(schema, req.body);
    if(result)
        return createErrorResponse(res, result, 422);

    //check if auth credentials exist
    const role = await roleRepository.findOne({clientId: res.clientId, name:req.body.name});
    if(role)
        return createErrorResponse(res,"Role exists", 422);

    return next();
};


exports.update = async (req, res, next) => {
    req.body.roleId = req.params.roleId;
    const schema = {
        roleId: Joi.string().required(),
    };
    const result = validate(schema, req.body);
    if(result)
        return createErrorResponse(res, result, 422);

    //check if auth credentials exist
    res.role = await roleRepository.findOne({_id: req.body.roleId});
    if(!res.role)
        return createErrorResponse(res,"We were unable to get role. Please try again...", 422);

    return next();
};

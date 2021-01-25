"use strict";
const Joi = require("@hapi/joi");
const { validate } = require("../helper");


const clientRepository = require("./ClientRepository");
exports.create = async  (req, res, next) => {

    const schema = {
        name: Joi.string().required(),
        email: Joi.array().items(Joi.string().email().required()).required()
    };

    const error = validate(schema, req.body);
    if(error)
        return createSuccessResponse(res, error, 422);


    //checkout if this user has created another service with the same name
    let check = await clientRepository.findOne({name: req.body.name});
    if(check)
        return createErrorResponse(res, "A Client with the same name exists!!!", 419);

    return next();
};

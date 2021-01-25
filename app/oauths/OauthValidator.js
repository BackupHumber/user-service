"use strict";

const Joi = require("@hapi/joi");
const {validate} = require("../helper");

exports.authorize = async (req, res,next) => {
    const schema = {
        clientId: Joi.string().required(),
        grantType: Joi.array().items(Joi.object().keys({
            label: Joi.string(),
            type: Joi.string()
        })).required(),
        redirectURL: Joi.string().uri().required()
    };

    const result = validate(schema, req.body);
    if (result)
        return createErrorResponse(res, result, 422);

    return next();
};
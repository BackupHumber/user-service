"use strict";
const debug = require("debug")("app:debug");
const {validate} = require("../helper");

const Joi = require("@hapi/joi");

exports.save = async (req, res, next) => {
    const schema = {
        components: Joi.array().items(Joi.string().required()).required()
    };

    const result = validate(schema, req.body);
    if (result)
        return createErrorResponse(res, result, 422);

    return next();
};

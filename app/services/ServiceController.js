"use strict";

// const serviceRepository = require("./ServiceRepository");
const serviceService = require("./ServiceService");

exports.list = async (req, res, next) => {
    return createSuccessResponse(res, await serviceService.fetchServices());
};




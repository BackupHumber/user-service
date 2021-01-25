"use strict";
const Repository = require("../MongoDBRepository");
const ServiceModel = require("./ServiceModel");
class ServiceRepository extends Repository{
    constructor() {
        super(ServiceModel);
    }

}

module.exports = (new ServiceRepository());
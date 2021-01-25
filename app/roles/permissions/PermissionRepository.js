"use strict";

const Permission = require('./PermissionModel');
const Repository = require("../../MongoDBRepository");

class PermissionRepository extends Repository{
    constructor(){
        super(Permission);
    }
}
module.exports = (new PermissionRepository());

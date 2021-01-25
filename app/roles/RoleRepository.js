"use strict";

const Role = require('./RoleModel');
const Repository = require("../MongoDBRepository");

class RoleRepository extends Repository{
    constructor(){
        super(Role);
    }

    findOrReturnDefault(clientId, roleId){
        return this.findOne(!roleId ? {clientId, isDefault: true} : {_id: roleId});
    }
}
module.exports = (new RoleRepository());

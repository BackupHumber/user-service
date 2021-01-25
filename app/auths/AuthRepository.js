"use strict";

const Auth = require('./AuthModel');
const Repository = require("../MongoDBRepository");

class AuthRepository extends Repository{
    constructor(){
        super(Auth);
    }

    getFillable(){
        //password is excluded because we want to avoid updating a password during a general update
        return ["roleId", "email", "phoneNumber"];
    }

}
module.exports = (new AuthRepository());
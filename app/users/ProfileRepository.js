"use strict";

const Profile = require('./ProfileModel');
const Repository = require("../MongoDBRepository");

class ProfileRepository extends Repository{
    constructor(){
        super(Profile);
    }

    nonMetaFields(){
        return ["name","avatar"];
    }

    nonUpdateField(){
        return ["clientId"];
    }
}
module.exports = (new ProfileRepository());

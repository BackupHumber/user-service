"use strict";

const Repository = require("../MongoDBRepository");
const SocialAuth = require("./SocialAuthModel");
class SocialAuthRepository extends Repository{
    constructor() {
        super(SocialAuth);
    }

}
module.exports = (new SocialAuthRepository());

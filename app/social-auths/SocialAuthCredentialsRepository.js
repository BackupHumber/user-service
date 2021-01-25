"use strict";

const Repository = require("../MongoDBRepository");
const SocialAuthCredentials = require("./SocialAuthCredentialModel");
class SocialAuthCredentialsRepository extends Repository{
    constructor() {
        super(SocialAuthCredentials);

    }

}

module.exports = (new SocialAuthCredentialsRepository());

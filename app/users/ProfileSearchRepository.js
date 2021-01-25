"use strict";
const ElasticsearchRepository = require("../ElasticRepository");
const {ES_INDEX} = require("../Constants");
class ProfileSearchRepository extends ElasticsearchRepository{
    constructor() {
        super(ES_INDEX.USERS);
    }
}

module.exports = (new ProfileSearchRepository());

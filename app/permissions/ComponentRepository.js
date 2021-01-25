"use strict";

const Component = require('./ComponentModel');
const Repository = require("../MongoDBRepository");

class ComponentRepository extends Repository{
    constructor(){
        super(Component);
    }
}
module.exports = (new ComponentRepository());

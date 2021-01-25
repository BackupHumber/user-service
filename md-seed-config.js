require("dotenv").config({});
require("./startups/queue");
const mongoose = require('mongoose');
const Clients = require("./databases/seeders/clients.seeder");
const Admin = require("./databases/seeders/admin.seeder");
const Roles = require("./databases/seeders/roles.seeder");
const Permissions = require("./databases/seeders/permissions.seeder");
const Users = require("./databases/seeders/user-to-elasticsearch.seeder");


const mongoURL = `${process.env.MONGODB_URL}/micro_user_${process.env.NODE_ENV}?retryWrites=true`;

console.log("MONGO_DB_FULL_URL", mongoURL);
/**
 * Seeders List
 * order is important
 * @type {Object}
 */
exports.seedersList = {
    Roles,
    Admin,
    Clients,
    Permissions,
    Users
};
/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
exports.connect = async () =>{
    mongoose.set("debug", true);
    await mongoose.connect(mongoURL, {useNewUrlParser: true});
};

/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
exports.dropdb = async () => mongoose.connection.db.dropDatabase();

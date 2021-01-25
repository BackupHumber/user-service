"use strict";
const fs = require("fs");
exports.getPermissions = async () => {
    let userPermissions = JSON.parse(await fs.readFileSync("permission-files/users.json"));
    // let accountPermissions = JSON.parse(await fs.readFileSync("permission-files/account-permissions.json"));
    // let campaignPermissions = JSON.parse(await fs.readFileSync("permission-files/campaign-permissions.json"));
    // return [...userPermissions, ...accountPermissions, ...campaignPermissions];
    return  userPermissions;
};

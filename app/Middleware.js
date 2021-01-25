const {verifyJWT} = require("./helper");
const {CLIENT_DEFAULT, SECRET_DEFAULT, ROLE_ADMIN, INTERNAL_SECURITY_TOKEN} = require("./Constants");
const debug = require("debug")("app:debug");
const clientRepository = require("./clients/ClientRepository");
const rolePermissionRepository = require("./roles/permissions/PermissionRepository");
const authRepository = require("./auths/AuthRepository");
const socialAuthRepository = require("./social-auths/SocialAuthRepository");

exports.authenticate = async (req, res, next) => {
    try {

        if(req.headers.source != "api-gateway"){
            console.log("================== Internal Service Call ===============");
            res.allowPass = true;
            return next();
        }

        console.log("req.headers.authenticationType",req.headers["authentication-type"]);
        if (req.headers["authentication-type"] == "client-secret") {
            res.allowPass = true;
            return next()
        }
        console.log("=============== Decoding Token ================", res.client?.secret);

        const user = req.headers.user && JSON.parse(req.headers.user);
        if (!user) throw new Error("Failed to authenticate token. ");

        debug("User", user);
        res.user = await authRepository.findOne({userId: user.userId});
        if (!res.user)
            return createErrorResponse(res, "Failed to authenticate token", 401);

        // res.authType = "social";
        res.authType = user.type || "auth";
        res.user = res.user.toJSON();
        res.userType = user.type;

        if (res.clientId != "default") {
            req.body.clientId = req.params.clientId = req.query.clientId = req.headers["client_id"] || req.headers["client-id"];
            res.clientId = res.user.clientId;
        }

        return next();
    } catch (e) {
        debug(e);
        return createErrorResponse(res, "Failed to authenticate token", 400);
    }
};

exports.getClientCredentials = async (req, res, next) => {
    try {

        let internalSecurityToken = req.headers["internal-security-token"];
        if(internalSecurityToken){
            const alphaToken = await cache.getAsync(INTERNAL_SECURITY_TOKEN);
            console.log("Alpha Token", alphaToken, "INT", internalSecurityToken);
            if(internalSecurityToken == alphaToken){
                console.log("Alpha Token Allowed", alphaToken, "INT", internalSecurityToken);
                res.allowPass = true;
                if(res.clientId && res.clientId != CLIENT_DEFAULT)
                    req.body.clientId = req.params.clientId = req.query.clientId = res.clientId;
                return next();
            }
        }

        res.clientId = req.headers["client_id"] || req.headers["client-id"];
        // res.client = JSON.parse()
        if (!res.clientId)
            return createErrorResponse(res, "You are not authorized to use this service", 403);

        if (res.clientId == CLIENT_DEFAULT)
            return next();

        req.body.clientId = req.params.clientId = req.query.clientId = res.clientId;
        let client = await clientRepository.findById(res.clientId);
        if (!client)
            return createErrorResponse(res, "You don't have permission to access this service. ", 403);
        res.client = client;
        return next();
    } catch (e) {
        debug(e);
        return createErrorResponse(res, "You don't have permission to access this service. ", 403);
    }
};

exports.onlyMaster = async (req, res, next) => {
    try {
        if (res.allowPass)
            return next();

        if (res.clientId == CLIENT_DEFAULT)
            return next();

        return createErrorResponse(res, "You don't have permission to access this service. ", 403);
    } catch (e) {
        debug(e);
        return createErrorResponse(res, "Failed to authenticate token");
    }
};


exports.IAM = (req, res, next) => {

    //if admin -> check if its default or client Id  = clientId of the user
    if (res.allowPass)
        return next();

    debug("User", res.user);
    // if(res.clientId != CLIENT_DEFAULT && res.user.role.name !=  ROLE_ADMIN && res.user.userId != req.params.id)
    if (res.clientId != CLIENT_DEFAULT && res.user.userId != req.params.id)
        return createErrorResponse(res, "Unauthorized", 401);

    //if its not a system admin then add the clientId query
    if (res.clientId != CLIENT_DEFAULT)
        req.body.clientId = req.query.clientId = res.clientId;

    return next();
};


exports.can = (permission) => {
    //say permission is == "create-role"
    return [
        async (req, res, next) => {
            if (res.allowPass)
                return next();

            if (res.clientId == CLIENT_DEFAULT)
                return next();


            const permissionCount = await rolePermissionRepository.count({roleId: res.user.roleId});
            //if count is 0, then the person has access to all the routes
            if (permissionCount == 0) {
                res.permission = {owner: false};
                return next();
            }


            res.permission = await rolePermissionRepository.findOne({roleId: res.user.roleId, key: permission});
            if (!res.permission)
                return createErrorResponse(res, "You do not have the rights to access this resource", 403);

            if (res.permission.owner) req.body.userId = req.query.userId = res.user.userId;

            return next();
        }
    ];

};

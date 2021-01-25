"use strict";
const debug = require("debug")("app:debug");
const {DateTime} = require("luxon");


const socialAuthCredentialsRepository = require("./SocialAuthCredentialsRepository");
const socialAuthRepository = require("./SocialAuthRepository");
const authRepository = require("../auths/AuthRepository");
const authService = require("../auths/AuthService");
const roleRepository = require("../roles/RoleRepository");
const socialInterface = require("./SocialInterface");
const userRepository = require("../users/ProfileRepository");
const {ROLE_USER, CLIENT_DEFAULT} = require("../Constants");
const {generateJWT} = require("../helper");
/**
 * Save Social Auth Credentials
 * @param req
 * @param res
 * @return {Promise<void>}
 */
exports.saveCredentials = async (req, res) => {
    let socialCredentials = await socialAuthCredentialsRepository.findOne({
        clientId: res.clientId
    });
    if (!socialCredentials) {
        socialCredentials = await socialAuthCredentialsRepository.create({
            clientId: res.clientId,
            credentials: {
                [req.params.provider]: req.body
            }
        });
    } else {
        debug("Here", "000", socialCredentials);
        socialCredentials.credentials = {
        ...socialCredentials.credentials,
                [req.params.provider]: req.body
        };
        await socialCredentials.save();
    }
    return createSuccessResponse(res, socialCredentials);
};


exports.getRequestUrl = async (req, res) => {
    //get social auth credentials from clientId
    let socialCredentials = await socialAuthCredentialsRepository.findOne({
        clientId: res.clientId
    });

    //verify if provider type exists on the platform and if client has credential for that type
    if (!socialCredentials)
        return createErrorResponse(res, "Social Auth Credentials Not Found", 404);

    socialCredentials = socialCredentials.toJSON();
    if (!socialCredentials.credentials || !socialCredentials.credentials[req.params.provider])
        return createErrorResponse(res, `${req.params.provider.toUpperCase()} Auth Credentials Not Found`, 404);

    const {error, url} = await socialInterface[req.params.provider].getRequestUrl(
        socialCredentials.credentials[req.params.provider],
        req.query.redirectUrl
    );
    //if it exists then pass it into the interface
    if (error)
        return createErrorResponse(res, error, 504);

    return createSuccessResponse(res, url);
};


exports.verifyAccess = async (req, res, next) => {
    try {
        //get social auth credentials from clientId
        //Todo: "handle Role ID"

        let socialCredentials = await socialAuthCredentialsRepository.findOne({
            clientId: res.clientId
        });
        //verify if provider type exists on the platform and if client has credential for that type
        if (!socialCredentials)
            return createErrorResponse(res, "Social Auth Credentials Not Found", 404);

        socialCredentials = socialCredentials.toJSON();
        if (!socialCredentials.credentials || !socialCredentials.credentials[req.params.provider])
            return createErrorResponse(res, `${req.params.provider.toUpperCase()} Auth Credentials Not Found`, 404);

        const {error, data, code} = await socialInterface[req.params.provider].verifyAccess(socialCredentials.credentials[req.params.provider], req.query);
        console.log("Errors", error, data);

        if (error)
            return createErrorResponse(res, error, code || 500);

        let query = {
            clientId: res.clientId,
            providerUserId: data.providerUserId
        };

        //get authentication that matches the email if it exists
        let userId, auth, user, socialAuth;
        if (data.email) {

            //check if we have a manual credentials matching the email
            auth = await authRepository.findOne({
                clientId: res.clientId,
                email: data.email
            });

            if (auth) {
                userId = auth.userId;
                user = await userRepository.findById(userId);
            }

            query = {
                $or: [
                    query,
                    {
                        clientId: res.clientId,
                        email: data.email
                    }
                ]
            };
        }

        //get role
        //Todo Make role comform to default role
        const role = await roleRepository.findOne({
            clientId: res.clientId,
            isDefault: true
        });

        socialAuth = await socialAuthRepository.findOne(query);
        //if user is empty  and social auth is not empty, get the old userId and use it
        if (!user && socialAuth) {
            debug("Dat", socialAuth.userId);
            user = await userRepository.find(socialAuth.userId);
        }

        //if there is no user, then create a new user
        if (!user) {
            user = await userRepository.create({
                name: data.name,
                clientId: res.clientId,
                meta: {
                    email: data.email,
                    avatar: data.profile_image_url_https || data.profile_image_url
                }
            });
        }

        //get social auth if it exists
        const socialAuthData = {
            userId: user._id.toString(),
            roleId: role._id.toString() || "",
            email: data.email,
            provider: req.params.provider,
            providerUserId: data.providerUserId,
            token: data.token,
            secret: data.secret,
            clientId: res.clientId,
            meta: data
        };
        if (!socialAuth)
            socialAuth = await socialAuthRepository.create(socialAuthData);
        else {
            await socialAuth.update(socialAuthData);
        }

        if (!auth && data.email) {
            //generate Auth
            auth = await authRepository.create({
                userId: user._id.toString(),
                email: data.email,
                roleId: role._id.toString() || "",
                clientId: res.clientId
            });
        }
        auth = auth.toJSON();
        auth.type = "social";
        socialAuth = socialAuth.toJSON();
        socialAuth.profile = user.toJSON();
        delete socialAuth.meta;
        //generate token

        const {token, refresh} = await authService.generateTokens(auth, res.client.secret,"social");
        //audit trail
        audit.trail(res.clientId,"You Signed in via " + req.params.provider,
            "Sign in",
            auth
        );

        return createSuccessResponse(res, {
            user: socialAuth,
            token,
            refresh
        }, 201);
    } catch (e) {
        debug(e);
        return createErrorResponse(res, e.message, 500);
    }
};
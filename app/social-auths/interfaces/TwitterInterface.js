"use strict";

const Joi = require("@hapi/joi");
const debug = require("debug")("app:debug");
const {validate} = require("../../helper");
const Twitter = require("node-twitter-api");

module.exports = {

    validateCredentials: async (body) => {
        let schema = {
            consumerApiKey: Joi.string().required(),
            consumerApiSecret: Joi.string().required()
        };
        return validate(schema, body);
    },

    getRequestUrl: async (credentials, callbackUrl) => {
        try {
            let twitter = new Twitter({
                consumerKey: credentials.consumerApiKey,
                consumerSecret: credentials.consumerApiSecret,
                callback: callbackUrl
            });
            let {error, response} = await (new Promise((resolve, reject) => {
                twitter.getRequestToken((err, requestToken, requestSecret) => {
                    if (err)
                        return reject({error: error});
                    return resolve({response: {requestToken, requestSecret}});
                });
            }));
            if (error) {
                return {
                    error
                }
            }
            console.log("Response", response);
            cache.setAsync(response.requestToken, response.requestSecret)
                .then(debug)
                .catch(debug);

            const redirectUrl = "https://api.twitter.com/oauth/authenticate?oauth_token=" + response.requestToken;
            return {
                url: redirectUrl
            };
        } catch (e) {
            console.log("Error", e);
            return {
                error: e.message
            }
        }

    },

    validateVerifyAccess: async (body) => {
        let schema = {
            oauthToken: Joi.string().required(),
            oauthVerifier: Joi.string().required()
        };
        return validate(schema, body);
    },


    verifyAccess: async (credentials, query) => {
        try {
            let {oauthToken, oauthVerifier} = query;
            let twitter = new Twitter({
                consumerKey: credentials.consumerApiKey,
                consumerSecret: credentials.consumerApiSecret
            });
            let requestSecret = await cache.getAsync(oauthToken);
            if (!requestSecret)
                return {error: "Request Secret Not Found", code: 404};

            //get access token
            let {error, response, code} = await (new Promise((resolve, reject) => {
                twitter.getAccessToken(oauthToken, requestSecret, oauthVerifier, (err, accessToken, accessSecret) => {
                    if (err) {
                        return resolve({error: err.data || err, code: err.statusCode || 500});
                    }

                    console.log(err, accessToken, accessSecret);

                    return resolve({response: {accessToken, accessSecret}});
                });
            }));

            if (error) {
                return {
                    error,
                    code: code || 504
                }
            }

            //get user details
            response = await (new Promise((resolve, reject) => {
                twitter.verifyCredentials(response.accessToken, response.accessSecret, {
                    skip_status: false,
                    include_email: true,
                    include_entities: false
                }, (err, user) => {
                    if (err)
                        return resolve({error: err});
                    return resolve({
                        data: {
                            ...user,
                            token: response.accessToken,
                            secret: response.accessSecret,
                            providerUserId: user.id_str || user.id,
                            avatar: user.profile_image_url_https || user.profile_image_url,
                            oauthToken,
                            oauthVerifier,
                            requestSecret
                        }
                    });
                });
            }));

            return response;
        } catch (e) {
            return {
                error: e.error.data || e.error || e.message
            }
        }
    }
};
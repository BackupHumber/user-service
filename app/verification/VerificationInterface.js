"use strict";
const Joi = require("@hapi/joi");
const debug = require("debug")("app:debug");
const {DateTime} = require("luxon");
const {EVENT} = require("tm-constants");
const {formatPhoneNumber} = require("tm-utils");
const {SMSBuilder, EmailBuilder} = require("tm-notification");
const randomString = require("crypto-random-string");

const {validate} = require("../helper");
const authRepository = require("../auths/AuthRepository");
const profileRepository = require("../users/ProfileRepository");
const roleRepository = require("../roles/RoleRepository");
const userEvents = require("../../events/UserEvent");

const phoneNumberVerification = {
    send: {
        validate: async (body) => {
            body.value = formatPhoneNumber(body.value || body.phoneNumber, body.countryCode || "NG");
            const schema = {
                value: Joi.required().label("Phone Number"),
            };
            return validate(schema, body);
        },

        execute: async (body, client, type) => {
            let {createIfNotExist, value: phoneNumber, clientId, roleId, smsProvider} = body;
            let user = await authRepository.findOne({phoneNumber, clientId});
            if (!user) {
                if (!createIfNotExist) return {error: "User Not Found", errorCode: 404};

                //create profile
                let profile = await profileRepository.create({
                    clientId
                });

                //if role is no passed, get the default role
                const role = await roleRepository.findOne(!roleId ? {clientId, isDefault: true} : {_id: roleId});
                if (!role) return {error: "No Default Role", errorCode: 500};
                roleId = role._id.toString();

                //create auth details
                user = await authRepository.create({
                    roleId,
                    clientId,
                    phoneNumber,
                    userId: profile._id.toString()
                });
                userEvents.emit(EVENT.USER.CREATED, {...user.toJSON(), profile: profile.toJSON()});
                //create a new user here
            }
            let code = (isDevelopment || process.env.USE_STATIC_VERIFICATION_CODE) ? 4777 : randomString({
                length: 4,
                type: "numeric"
            });
            debug("generating code", process.env.NODE_ENV, code);

            //get cache response
            let response = await cache.setAsync(`phone-verification-${clientId}-${phoneNumber}`, code, "EX", 300);
            debug("Response", response, code);

            const builder = (new SMSBuilder(clientId))
                .startBuild();

            if(!process.env.USE_STATIC_VERIFICATION_CODE){
                const message = `Your ${client.name} verification code is ${code}.`;
                builder.setClientId(clientId)
                    .setProvider(smsProvider)
                    .setRecipients(phoneNumber)
                    .setMessage(message)
                    .send()
                    .then(debug)
                    .catch(debug);
            }

            return {
                data: user
            };
        }
    },
    verify: {
        validate: async (body) => {
            const schema = {
                value: Joi.required().label("Phone Number"),
                code: Joi.required().label("Verification Code")
            };
            return validate(schema, body);
        },

        execute: async (body) => {
            let {code, value, clientId} = body;
            let phoneNumber = formatPhoneNumber(value);
            let user = await authRepository.findOne({phoneNumber, clientId});
            if (!user)
                return {error: "User Not Found", errorCode: 404};

            let cacheData = await cache.getAsync(`phone-verification-${clientId}-${phoneNumber}`);
            if (!cacheData || (code != cacheData))
                return {error: "Token Mismatch", errorCode: 500};

            if (!user.phoneNumberVerifiedAt) {
                user.phoneNumberVerifiedAt = DateTime.local().toMillis();
                await user.save();
            }
            cache.clear(`phone-verification-${clientId}-${phoneNumber}`)
                .then(debug)
                .catch(debug);

            return {data: user};
        }
    }
};


const emailVerification = {
    send: {
        validate: async (body) => {
            body.value = body.value || body.email || body.emailAddress;
            const schema = {
                value: Joi.required().label("Email"),
            };
            return validate(schema, body);
        },

        execute: async (body, client, type) => {
            console.log(body, client, '------------');


            let {createIfNotExist, value: email, clientId, roleId} = body;
            clientId = clientId || 'default';

            let user = await authRepository.findOne({email, clientId});
            if (!user) {
                if (!createIfNotExist) return {error: "User Not Found", errorCode: 404};

                //create profile
                let profile = await profileRepository.create({
                    clientId
                });

                //if role is no passed, get the default role
                const role = await roleRepository.findOne(!roleId ? {clientId, isDefault: true} : {_id: roleId});
                if (!role) return {error: "No Default Role", errorCode: 500};
                roleId = role._id.toString();

                //create auth details
                user = await authRepository.create({
                    roleId,
                    clientId,
                    phoneNumber,
                    userId: profile._id.toString()
                });
                userEvents.emit(EVENT.USER.CREATED, {...user.toJSON(), profile: profile.toJSON()});
                //create a new user here
            }
            let code = !isProduction ? 4777 : randomString({
                length: 4,
                type: "numeric"
            });
            debug("production generating code", process.env.NODE_ENV, code);

            //get cache response
            let response = await cache.setAsync(`email-verification-${clientId}-${email}`, code, "EX", 1000000);
            debug("Response", response, code);

            const emailBuilder = new EmailBuilder(clientId);
            const builder = emailBuilder.startBuild()
                .setProvider("sendgrid")
                .setFrom(client?.email || 'app@mail.com')
                .setSubject("Email Verification")
                .setRecipients(email || 'oseimensahisaiah@gmail.com');

            builder.setHeader()
                .setTitle("Email Verification")
                // .setBGColor("green")
                .setAppLogo(client?.logo || "here")
                .setAppUrl(client?.appURL || 'here')
                .setAppName(client?.name || 'Test App');


            builder.setBody()
                .setContent(`Your ${type || "verification"} code is ${code}. -- ${client?.name || 'test name'}`)
                .setGreeting("Hi there,");


            const res = await builder.send().then(debug)
                .catch(debug);
            console.log("Response", res); //    Response { data: 'Email Sent' }     

            return {
                data: user
            };
        }
    },
    verify: {
        validate: async () => {
            const schema = {
                value: Joi.required().label("Email"),
                code: Joi.required().label("Verification Code")
            };
            return validate(schema, body);
        },

        execute: async () => {
            let {code, value, clientId} = body;
            let email = value;
            let user = await authRepository.findOne({email, clientId});
            if (!user)
                return {error: "User Not Found", errorCode: 404};

            let cacheData = await cache.getAsync(`email-verification-${clientId}-${email}`);
            if (!cacheData || (code != cacheData))
                return {error: "Token Mismatch", errorCode: 500};

            if (!user.emailVerifiedAt) {
                user.emailVerifiedAt = DateTime.local().toMillis();
                await user.save();
            }
            cache.clear(`email-verification-${clientId}-${email}`)
                .then(debug)
                .catch(debug);

            return {data: user};
        }
    }
};


module.exports = {
    phone: phoneNumberVerification,
    email: emailVerification,
    phoneNumber: phoneNumberVerification,
    emailAddress: emailVerification,
    supportedVerificationType: ["email", "phone", "emailAddress", "phoneNumber"]
};



"use strict";
const moment = require("moment");
const bcrypt = require("bcryptjs");
const debug = require("debug")("app:debug");
const {EVENT} = require("tm-constants");
const _ = require("lodash");
const randomString = require("crypto-random-string");

const profileRepository = require("./ProfileRepository");
const roleRepository = require("../roles/RoleRepository");
const authRepository = require("../auths/AuthRepository");
const profileSearchRepository = require("./ProfileSearchRepository");


// const userEvents = require("../../events/UserEvent");
const {ES_INDEX} = require("../Constants");


exports.save = async (body, operation = "create") => {
    try {
        const esPayload = {
            id: body.userId,
            operation,
            index: ES_INDEX.USERS,
            elasticsearchUrl: process.env.ELASTICSEARCH_URL,
            body
        };
        console.log("ESPayload", process.env.ELASTICSEARCH_RUNNER_QUEUE, process.env.RABBITMQ_URL);
        const queueResponse = await Queue.queue(process.env.ELASTICSEARCH_RUNNER_QUEUE, esPayload, {
            persistent: true,
            priority: 10
        });
        console.log("Queue ES Response", queueResponse);
        return queueResponse;
    } catch (e) {
        console.log("Error", e);
        return e;
    }
};


exports.searchUsingElasticsearch = async ({dateTo, dateFrom, keyword, ...query}, options = {}) => {
    try {
        const must = profileSearchRepository.appendMultiplePropertyMatch(query);
        if (dateFrom) {
            dateFrom = moment(dateFrom).startOf("day").format("x");
            dateTo = moment(dateTo).endOf("day").format("x");
            must.push(profileSearchRepository.appendDateRange("createdAt", dateFrom, dateTo));
        }

        let body = {
            query: {
                bool: {
                    must
                }
            }
        };

        console.log("Body", JSON.stringify(body));
        const count = await profileSearchRepository.count(body);
        body._source = ["userId"];
        body.sort = [
            {createdAt: {order: "desc"}}
        ];

        if (options.page) {
            body.from = ((options.page - 1) * options.limit);
            body.size = options.limit;
        }


        const results = await profileSearchRepository.search(body);
        console.log("Results", results);
        return {
            data: results?.data?.map(result => result.userId),
            total: count?.body?.count || results.total
            // data: results

        }

    } catch (e) {
        console.log("Error", e);
        logException(e, {dateTo, dateFrom, keyword, ...query, options});
        return {error: e.message};
    }
};


exports.createUser = async (body) => {
    try{
        let {clientId, roleId, name, email, phoneNumber, password, parentId, changePasswordOnLogin = false, ...meta} = body;
        let role;
        if(!roleId){
            role = await roleRepository.findOrReturnDefault(clientId, roleId);
            if (!role)
                return {error:"Role has not been defined for this client.", errorCode: 400};

            roleId = role._id;
        }

        let user = {
            clientId,
            name,
            meta
        };
        password = password || (changePasswordOnLogin ? randomString({length: 12}) : "");
        //create user
        user = await profileRepository.create(user);
        //generate Auth
        let auth = await authRepository.create({
            userId: user._id.toString(),
            email,
            roleId,
            clientId,
            phoneNumber,
            password: bcrypt.hashSync(password, 10),
            parentId,
            meta: {
                changePasswordOnLogin
            }
        });

        auth = auth.toJSON();
        if (changePasswordOnLogin) auth.password = password;
        auth.profile = user.toJSON();
        //generate an event
        console.log("User events", userEvents);
        userEvents.emit(EVENT.USER.CREATED, auth);
        //generate token
        return {
            data: auth
        };
    }catch (e) {
        console.log("error when creating user", e);
        logException(e, body, true);
        return {error: e.message};
    }
};

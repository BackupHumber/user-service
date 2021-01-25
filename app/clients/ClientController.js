"use strict";
const {EVENT} = require("tm-constants");
const debug = require("debug")("app:debug");
const clientRepository = require("./ClientRepository");
const {CACHE_KEY, EVENTS} = require("../Constants");
const serviceService = require("../services/ServiceService");
const clientEvents = require("../../events/ClientEvent");
/**
 * Create a Client on the platform
 * @param req
 * @param res
 * @param next
 * @return {Promise<*>}
 */
exports.create = async (req, res, next) => {
    let {
        email,
        name,
        logo,
        appURL,
        countryCode,
        allowedServices = ["user-service"],
        userRequiredFields = [],
        ...payload
    } = req.body;

    //if allowedService is empty, then allow all service
    if(allowedServices.length == 0)
        allowedServices = (await serviceService.fetchServices()).map(service => service.key);

    if(!allowedServices.includes("user-service"))
        allowedServices.push("user-service");

    let client = await clientRepository.create({
        createdBy: res.user.userId,
        clientId: await clientRepository.generateClientId(),
        secret: await clientRepository.generateSecret(),
        appURL,
        email,
        logo,
        name,
        countryCode,
        allowedServices,
        userRequiredFields,
        meta: payload
    });

    if (!client)
        return createErrorResponse(res, "Unable to create client at this moment. Please try again", 500);
    debug("==================Generating Client Events====================");
    clientEvents.emit(EVENT.CLIENT.CREATED, client.toJSON());
    return createSuccessResponse(res, client);
};

exports.fetch = async (req, res, next) => {
    const {page, limit, ...query} = req.query;
    const clients = await clientRepository.all(query || {}, {}, page, limit);
    return createSuccessResponse(res, clients);
};

exports.update = async (req, res, next) => {
    let {clientId, secret, ...payload} = req.body;
    let client = await clientRepository.findOne({clientId: req.params.clientId});
    console.log("Clients", client);
    if(!client)
        return createErrorResponse(res, "Client Not Found", 404);

    // client = client.toJSON();
    let meta = {...client.meta};
    const update = {};
    for(let c in payload){
        if(!payload.hasOwnProperty(c))
            continue;

        if(clientRepository.getNonMetaFields().includes(c)){
            update[c] = payload[c];
            continue;
        }

        meta[c] = payload[c];
    }
    update.meta = meta;
    await client.update(update);
    // await clientRepository.update({clientId: client.clientId}, update);
    client = {...client.toJSON(), ...update};
    clientEvents.emit(EVENT.CLIENT.UPDATED, client);
    return createSuccessResponse(res, client);
};

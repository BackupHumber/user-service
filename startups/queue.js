"use strict";
const RabbitMQ = require("amqp-library");
const Queue = new RabbitMQ();
const debug = require("debug")("app:debug");
const {EVENT} = require("tm-constants");
require("../events/UserEvent");
require("../events/ClientEvent");
const init = async () => {
    try{
        debug("RabbitMQ", process.env.RABBITMQ_URL);
        const connection = await Queue.init();
        await Queue.createChannel(process.env.ELASTICSEARCH_RUNNER_QUEUE || "", {durable: true, maxPriority: 10});
        await Queue.assertExchange("health.check", "fanout", {durable: true});
        await Queue.assertExchange(EVENT.CLIENT.CREATED, "fanout", {durable: true});
        await Queue.assertExchange(EVENT.CLIENT.UPDATED, "fanout", {durable: true});
        await Queue.assertExchange(EVENT.USER.CREATED, "fanout", {durable: true});
        await Queue.assertExchange(EVENT.USER.UPDATED, "fanout", {durable: true});
        await Queue.assertExchange(EVENT.USER.DELETED, "fanout", {durable: true});
        global.Queue = Queue;
        return Queue;
    }catch (e) {
        debug(e);
        logger(e.message, e.stack, {
            "critical": "Unable to connect to queue",
            url: process.env.RABBITMQ_URL
        });
        await Queue.close();
        throw e;
        // process.exit(1);
    }
};

init()
    .then(res => debug("Queue Connected"))
    .catch(err => debug("Queue Error", err));

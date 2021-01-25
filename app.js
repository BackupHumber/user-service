"use strict";
require("dotenv").config({});
const debug = require("debug")("app:debug");
let express = require('express');
require("express-async-errors");
const moment = require("moment");
const {getClientCredentials} = require("./app/Middleware");

let app = express();

const createError = require('http-errors');
require("./startups")(app, express);
const {formatPhoneNumber} = require("tm-utils");


global.isProduction = process.env.NODE_ENV == "production";
global.isDevelopment = process.env.NODE_ENV == "development";
global.isStaging = process.env.NODE_ENV == "staging";

app.use((req, res, next) => {
    req.body.clientId = req.params.clientId = req.query.clientId = req.headers["client-id"];
    let phoneNumber = req.body.phoneNumber || req.query.phoneNumber || req.params.phoneNumber;
    res.countryCode = req.body.countryCode || req.query.countryCode || req.params.countryCode;
    if (!phoneNumber)
        return next();
    req.body.phoneNumber = req.query.phoneNumber = req.params.phoneNumber = formatPhoneNumber(phoneNumber, res.countryCode || "NG");
    return next();
});

//request logger
app.use((req, res, next) => {
    // next();
    res.log = {
        environment: process.env.NODE_ENV || process.env.APP_ENV,
        startTime: Number(moment().utc(true).format("x")),
        requestId: req.headers["request-id"] || req.headers["request_id"] || Date.now(),
        clientId: req.headers["client-id"] || req.headers["client_id"],
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        ip: req.ip
    };
    console.log("Request Details", res.log);
    let url = req.protocol + '://' + req.get('host') + req.originalUrl;
    const cleanup = () => {
        res.removeListener('finish', logFn);
        res.removeListener('close', logFn);
        res.removeListener('error', logFn)
    };

    const logFn = (...args) => {
        cleanup();
        const logPayload = {
            ...res.log,
            response: res.response,
            logType: "request-response",
            code: res.statusCode,
            endTime: Number(moment().utc(true).format("x")),
            args
        };
        // console.log("Payload", res.response);
        graylog.info("Request-Response", url, logPayload, new Date());
    };

    res.on('finish', logFn); // successful pipeline (regardless of its response)
    res.on('close', logFn); // aborted pipeline
    res.on('error', logFn); // pipeline internal error
    return next();
});

//routes
require("./routes")(app);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    return next(createError(404));
});


// error handler
app.use((err, req, res, next) => {
    debug("Error", err);
    graylog.error(err.message, (new Error(err)).stack, {
        status: err.status,
        url: req.url
    });
    res.status(err.status || 500).json({error: err.message});
});

module.exports = app;

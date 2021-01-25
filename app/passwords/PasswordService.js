"use strict";
const randomString = require("crypto-random-string");
const debug = require("debug")("app:debug");
const EmailBuilder = require("../../utils/EmailBuilder");
const SMSBuilder = require("../../utils/SMSBuilder");
exports.sendVerificationEmail = async (client, email, phoneNumber, userId, name = "") => {
    let code = isProduction ? randomString({
        length: 6,
    }) : 123456;
    const cacheResponse = isProduction ? await cache.setAsync(userId, code, "EX", 1000000) :  await cache.setAsync(userId, code);
    console.log("Cache Response", cacheResponse, phoneNumber, email);
    if(email){
        const emailBuilder = new EmailBuilder(client.clientId);
        const builder = emailBuilder.setRecipient(email)
            .setSubject("Account Verification");

        builder.setBody()
            .setContent(`Thank you for signing up on ${client.name}. We are excited to have you on board. Please use the code below to verify your account. The code expires in 30 Minutes.<br/> <h1><strong>${code}</strong></h1>`)
            .setFooter(`Regards,\n.${client.name}\n`);


        builder.setHeader()
            .setAppName(client.name)
            .setAppUrl(client.meta && client.meta.appUrl)
            .setAppLogo(client.meta && client.meta.logo);

        builder.send()
            .then(debug)
            .catch(debug)
    }

    if(phoneNumber){
        const smsBuilder = new SMSBuilder(client.clientId);
        const builder = smsBuilder
            .setRecipient(phoneNumber)
            // .setSender(client.name)
            .setMessage(`Please use the code ${code} to verify your account.`);

        builder.send()
            .then(debug)
            .catch(debug);
    }



};


exports.sendResetPasswordEmail = async (client, email, phoneNumber, userId, name = "") => {
    let code = isProduction ? randomString({
        length: 6,
    }) : 123456;

    await cache.setAsync(userId, code, "EX", 1000000);
    if(email){
        const emailBuilder = new EmailBuilder(client.clientId);
        const builder = emailBuilder.startBuild()
            .setRecipient(email)
            .setSubject("Reset Password");


        builder.setBody()
            .setContent(`Please use the code below to reset your password. <br> <h2>${code}</h2>`)
            .setFooter(`Thank you, ${client.name}`);


        builder.setHeader()
            .setAppUrl(client.meta && client.meta.appUrl)
            .setAppLogo(client.meta && client.meta.logo)
            .setAppName(client.name);

        builder.send()
            .then(debug)
            .catch(debug);
    }

    if(phoneNumber){
        const smsBuilder = new SMSBuilder(client.clientId);
        const builder = smsBuilder
            .setRecipient(phoneNumber)
            .setSender(client.name)
            .setMessage(`Please use the code ${code} to reset your password.`);

        builder.send()
            .then(debug)
            .catch(debug);
    }


};

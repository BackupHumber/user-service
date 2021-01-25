"use strict";
const debug = require("debug")("app:debug");
const {EmailBuilder} = require("tm-notification");
const Emitter = require("events").EventEmitter;
const listener = new Emitter;
const {EVENT, CACHE} = require("tm-constants");
const roleRepository = require("../app/roles/RoleRepository");
const clientService = require("../app/clients/ClientService");
listener.on(EVENT.CLIENT.CREATED, async (client) => {
    console.log("CLIENT CREATED EVENT GENERATED", client);
    //generate a rabbitMQ event
    setImmediate(() => {
        const response = Queue.publish(EVENT.CLIENT.CREATED, "", {
            event: "client.created",
            data: client
        });
        debug("===========Rabbit Event Published==================", response);
    });

    //Create default admin and user role
    setImmediate(async () => {
        const roles = await roleRepository.all({clientId: "default"});
        const clientDefaultRoles = roles.map(role => {
            role = role.toJSON();
            delete role._id;
            role.clientId = client.clientId;
            return role;
        });
        await roleRepository.create(clientDefaultRoles);
        debug("===========Default Roles Created for clients ==================");
    });
    //send emails to client defaultNotificationEmail
    setImmediate(async () => {
        if (!client.email) {
            debug("===========Abort Sending Email: Email not provided==================");
            return;
        }

        const emailBuilder = new EmailBuilder();
        emailBuilder.setClientId(client.clientId)
            .setHeader()
            .setAppName(client.name)
            .setAppLogo(client.logo)
            .setAppUrl(client.appURL)
            .setTitle("Welcome To TM30 Wheeler Services");

        emailBuilder.setRecipients(client.email)
            .setSubject("Hurray, Your Client Account Created")
            .setFrom("info@tm30.net");

        emailBuilder.setBody()
            .setGreeting("Hello,")
            .setIntroLine("Thank you for creating an account with us. Please find below your access credentials")
            .setContent("You can use this credentials to access any of our services")
            .setOutroLine([
                `CLIENT ID: ${client.clientId}`,
                `CLIENT SECRET: ${client.secret}`
            ]);
        if (client.appURL){
            emailBuilder.setButton()
                .setLevel("primary")
                .setActionText("Click Here to go to your app")
                .setActionUrl(client.appURL);
        }

        // console.log(emailBuilder.build());
        emailBuilder.send()
            .then(debug)
            .catch(debug);

        debug("=========== Notification Email Sent! ==================");
    });
});

listener.on(EVENT.CLIENT.UPDATED, async client => {
   setImmediate(() => {
       clientService.putClientInCache(client);
       debug("==================Updating Cache===============");
   })
});

module.exports = listener;
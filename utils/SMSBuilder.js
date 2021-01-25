"use strict";
const axios = require("axios");
class SMSBuilder{
    constructor(clientId) {
        clientId = clientId || process.env.CLIENT_ID;
        if(!clientId)
            throw Error("Client ID is required");
        this._axios = axios.create({
            baseURL: process.env.API_GATEWAY_URL,
            headers: {
                "client-id": clientId
            }
        });
        this.startBuild();
    }

    startBuild(){
        this.props = {};
        return this;
    }

    setRecipient(recipients){
        if(!Array.isArray(recipients))
            recipients = [recipients];
        this.props["recipients"] = recipients;
        return this;
    }

    setSender(sender){
        this.props["sender"] = sender;
        return this;
    }

    setMessage(message){
        this.props["message"] = message;
        return this;
    }

    setProvider(provider){
        this.props["provider"] = provider;
        return this;
    }

    build(){
        return this.props;
    }

    async send(){
        try{
            if(process.env.NOTIFICATION_SERVICE_URL)
                return {data: (await this._axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/v1/sms`, this.build())).data};

            return {data: (await this._axios.post("notifications/v1/sms", this.build())).data};
        }catch (e) {
            const error = resolveAxiosError(e);
            return {error: error.raw.message || error};
        }
    }
}


module.exports = SMSBuilder;


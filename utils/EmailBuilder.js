"use strict";
const axios = require("axios");

class EmailBuilder {
    constructor(clientId) {
        console.log("CLientId", clientId);
        clientId = clientId || process.env.CLIENT_ID;
        if (!clientId)
            throw Error("Client ID is required");
        this._axios = axios.create({
            baseURL: process.env.API_GATEWAY_URL,
            headers: {
                "client-id": clientId
            }
        });
        this.startBuild();
        this.props["attachments"] = [];
        this.props["appName"] = process.env.APP_NAME;
    }

    startBuild() {
        this.props = this.props || {};
        return this;
    }

    setClientId(clientId) {
        this.props["client-id"] = clientId;
        return this;
    }

    setFrom(from) {
        this.props["from"] = from;
        return this;
    }

    setRecipient(recipient) {
        if (!Array.isArray(recipient))
            recipient = [recipient];
        this.props["recipients"] = recipient;
        return this;
    }

    setSubject(subject) {
        this.props["subject"] = subject;
        return this;
    }


    setHeader() {
        this.props["header"] = this.props["header"] || {};
        let that = this;
        return {
            setTitle(title) {
                that.props.header["title"] = title;
                return this;
            },

            setBGColor(bgColor) {
                that.props.header["bgColor"] = bgColor;
                return this;
            },

            setAppLogo(appLogo) {
                that.props.header["appLogo"] = appLogo;
                return this;
            },

            setAppName(appName) {
                that.props.header["appName"] = appName;
                return this;
            },

            setAppUrl(appUrl) {
                that.props.header["appUrl"] = appUrl;
                return this;
            },
        }
    }



    setReplyTo(replyTo) {
        this.props["replyTo"] = replyTo;
        return this;
    }

    setBody() {
        this.props["body"] = this.props.body || {};
        this.props.body["outroLines"] = [];
        this.props.body["introLines"] = [];
        let that = this;
        return {
            setContent(content) {
                that.props["content"] = content;
                that.props.body["content"] = content;
                return this;
            },
            setGreeting(greeting) {
                that.props.body["greeting"] = greeting;
                return this;
            },
            setSalutation(salutation) {
                that.props.body["salutation"] = salutation;
                return this;
            },
            setFooter(footer) {
                that.props.body["footer"] = footer;
                return this;
            },
            setIntroLine(lines) {
                if (!Array.isArray(lines)) {
                    that.props.body["introLines"].push(lines);
                } else {
                    that.props.body["introLines"].concat(lines);
                }
                return this;
            },
            setOutroLine(lines) {
                if (!Array.isArray(lines)) {
                    that.props.body["outroLines"].push(lines);
                } else {
                    that.props.body["outroLines"].concat(lines);
                }
                return this;
            },
        }
    }

    setButton() {
        that.props.meta["button"] = this.props.meta.button || {};
        return {
            setLevel(level) {
                that.props.meta.button["level"] = level;
                return this;
            },
            setActionUrl(actionLink) {
                that.props.meta.button["actionUrl"] = actionLink;
                return this;
            },
            setActionText(actionText) {
                that.props.meta.button["actionText"] = actionText;
                return this;
            }
        }
    }

    setAttachment(attachment){
        if(!Array.isArray(attachment))
            this.props["attachments"].push(attachment);
        else
            this.props["attachments"].concat(attachment);


        return this;
    }
    build() {
        return this.props;
    }

    async send() {
        try {
            console.log("Body", JSON.stringify(this.props));

            if(process.env.NOTIFICATION_SERVICE_URL)
                return {data: (await this._axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/v1/email`, this.build())).data};

            return {data: (await this._axios.post(`notifications/v1/email`, this.build())).data};
            // return{data:  (await this._axios.post(`/api/notification/v1/email`, this.build())).data};
        } catch (e) {
            const error = resolveAxiosError(e);
            logger(e.message, (new Error(e)).stack, error);
            return {error: error.raw.message || error};
        }
    }

}


module.exports = EmailBuilder;
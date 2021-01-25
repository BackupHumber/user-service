"use strict";
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    clientId: {type: String, allowNull: false, required: true, index: true},
    userId: {type: String, allowNull: false, required: true, index: true},
    roleId: {type: String, required: true},
    provider: {type: String},
    providerUserId: {type: String},
    email: {type: String},
    token: {type: String},
    secret: {type: String},
    meta: {type: Object}
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            delete ret._id;
        }
    },
    timestamps: true
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model("social_auths", schema);

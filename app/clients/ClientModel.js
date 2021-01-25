'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const clientService = require("./ClientService");

const schema = mongoose.Schema({
    clientId: {type: String, allowNull: false, required: true, index: true},
    secret: {type: String, allowNull: false, required: true},
    name: {type: String, required: true, allowNull: false},
    logo: {type: String},
    appURL: {type: String},
    countryCode: {type: String},
    email: {type: [String]},
    access: {type: String, default: "granted"},
    allowedServices: {type: [String], default: []},
    createdBy: {type: String,  allowNull: false, required: true},
    userRequiredFields: {type: [String]},
    meta: {type: Object}
}, {
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret.createdBy;
            delete ret.__v;
            delete ret._id;
        }
    },
    timestamps: true
});

schema.plugin(mongoosePaginate);
// schema.post("save", clientService.putClientInCache);
module.exports =  mongoose.model("clients", schema);

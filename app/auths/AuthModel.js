'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    clientId: {type: String, allowNull: false, required: true, index: true},
    userId: {type: String,  allowNull: false, required: true, index: true},
    roleId: {type: String, required: false, index: true},
    email: {type: String, index: true},
    phoneNumber: {type: String, index: true},
    password: {type: String, index: true},
    parentId:{type: String, index: true},
    emailVerifiedAt: {type: Number},
    phoneNumberVerifiedAt: {type: Number},
    meta: {type: Object}
},{
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            delete ret._id;
        }
    },
    timestamps: true
});

schema.index({"$**":"text"});
schema.plugin(mongoosePaginate);
module.exports =  mongoose.model("auths", schema);
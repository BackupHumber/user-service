'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    clientId: {type: String},
    roleId: {type: String, allowNull: false, required: true, index: true},
    key: {type: String, required: true},
}, {
    toJSON: {
        transform: function (doc, ret) {
            // ret.id = ret._id;
            delete ret.__v;
            delete ret._id;
            // delete ret.createdAt;
            // delete ret.updatedAt;
            // delete ret.clientId;
            // delete ret.roleId;
        }
    },
    timestamps: true
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model("role-components", schema);

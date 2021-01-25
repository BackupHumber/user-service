'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    clientId: {type: String, allowNull: false, required: true, index: true},
    name: {type: String, allowNull: false, required: true, index: true},
    isDefault: {type: Boolean, default: false},
    userRequiredFields:{type: [String]},
    createdBy: {type: String}
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret.permissions;
            delete ret.__v;
            delete ret.createdBy;
            delete ret._id;
        }
    },
    timestamps: true
});

schema.plugin(mongoosePaginate);
module.exports = mongoose.model("roles", schema);

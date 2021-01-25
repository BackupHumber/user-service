"use strict";
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    clientId: {type: String, allowNull: false, required: true, index: true},
    credentials: {type: Object, allowNull: false, required: true, index: true}
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

schema.index({"$**": "text"});
schema.plugin(mongoosePaginate);
module.exports = mongoose.model("social_auth_credentials", schema);
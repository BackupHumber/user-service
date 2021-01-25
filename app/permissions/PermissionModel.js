'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    name: {type: String, required: true},
    service: {type: String, required: true},
    group: {type: String},
    key: {type: String, index: true}
},{
    toJSON: {
        transform: function(doc, ret) {
            // ret.id = ret._id;
            delete ret.__v;
            delete ret._id;
        }
    },
    timestamps: true
});
schema.plugin(mongoosePaginate);
module.exports =  mongoose.model("permissions", schema);

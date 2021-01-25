'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    name: {type: String},
    key: {type: String, index: true},
    description: {type: String},
    meta: {type: Object}
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

schema.index({"$**":"text"});
schema.plugin(mongoosePaginate);
module.exports =  mongoose.model("services", schema);
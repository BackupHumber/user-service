'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const schema = mongoose.Schema({
    name: {type: String, required: true}
},{
    toJSON: {
        transform: function(doc, ret) {
            // ret.id = ret._id;
            delete ret.__v;
            delete ret._id;
        }
    },
});
schema.plugin(mongoosePaginate);
module.exports =  mongoose.model("components", schema);

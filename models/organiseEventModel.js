//organise events online where nearby people can find and join them

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
    name: {             //name of the event
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    // location: {
    //     //type: String,
    //     coordinates: [],
    //     //required: true,
    // },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: Number,
            required: true
        }
    },
    category: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        //required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{    //the users who are going to join the event
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    report: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    isReported: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('event', eventSchema);

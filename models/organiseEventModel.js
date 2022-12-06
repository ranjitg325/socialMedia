
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
    hashtag: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 30,
    },
    mention: [{
        type: mongoose.Types.ObjectId,
        ref: "user",
    }],
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "EventComment" }],
    shares: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    sharesCount: { type: Number, default: 0 },

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

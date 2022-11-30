const mongoose = require("mongoose");

//create a page where a lots of user can post their post in that specific page  and other user can see that post and can like and comment on that post when they follow that page

const pageSchema = new mongoose.Schema(
    {
        pageName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            minlength: 2,
            maxlength: 30,
        },
        description: {
            type: String,
            //required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        category: {
            type: String,
            //required: true,
            trim: true,
            minlength: 2,
            maxlength: 30,
        },
        coverImage: {
            type: String,
            //required: true,
        },
        //group page members can post in that page
        members: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        //group page admin
        admin: { type: mongoose.Types.ObjectId, ref: "user" },
        //group page posts
        posts: [{ type: mongoose.Types.ObjectId, ref: "post" }],

        content: {
            type: String,
            trim: true,
        },
        images: {
            type: Array,
        },
        // location: {
        //     lat : {
        //         type: Number,
        //     },
        //     lng : {
        //         type: Number,
        //     }
        // },
        // location: {
        //     type: String,
        //     coordinates: [],
        // },
        feeling: {
            type: String,
            enum: ["happy", "sad", "angry", "love", "bored", "confused", "tired", "surprised", "annoyed", "guilty", "hopeful", "nostalgic", "optimistic", "sick", "stressed", "prepared", "ashamed", "devastated", "furious", "humiliated", "jealous", "lonely", "miserable", "powerless", "rejected", "anxious", "confident", "content", "curious", "determined", "disappointed", "disgusted", "embarrassed", "excited", "grateful", "impressed", "inspired", "intimidated", "proud", "puzzled", "relaxed", "suspicious", "terrified", "triumphant", "worried"],
        },
        //feeling happy with me and 4 other friends
        feelingWith: [{
            //type: Array,
            type: mongoose.Types.ObjectId,
            ref: "user",
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
        //public or private
        privacy: {
            type: String,
            enum: ["public", "private"],
            default : "public"
        },
        //if page is private then all user id will be stored in requests
        requests :[{
            type : mongoose.Types.ObjectId,
            ref: "user",
        }],
        likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
        shares: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        sharesCount: { type: Number, default: 0 },
        report: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        isReported: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("page", pageSchema);
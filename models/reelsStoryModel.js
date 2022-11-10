//create a story model for users to show their story for 24 hours
const mongoose = require("mongoose");

//upload media for 24 hours
const storySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "user",
            required: true,
        },
        media: {
            type: Array,
            //required: true,
            //expires: 86400,
        },
    caption: {
        type: String,
        //required: true,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("story", storySchema);
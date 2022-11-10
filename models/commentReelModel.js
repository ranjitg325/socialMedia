const mongoose = require("mongoose");

const commentReelSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        //tag: Object,  //used to display the multimedia like audio,video etc
        reply: mongoose.Types.ObjectId,
        likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        user: { required:true, type: mongoose.Types.ObjectId, ref: "user" }, //the person who is going to comment
        reelId: mongoose.Types.ObjectId,
        reelUserId: mongoose.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("commentReel", commentReelSchema);
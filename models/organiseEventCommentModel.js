const mongoose = require("mongoose");

const organiseEventCommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        //tag: Object,  //used to display the multimedia like audio,video etc
        reply: mongoose.Types.ObjectId,
        likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        user: { required:true, type: mongoose.Types.ObjectId, ref: "user" }, //the person who is going to comment
        eventId: mongoose.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("EventComment", organiseEventCommentSchema);
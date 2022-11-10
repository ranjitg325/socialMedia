//share reel to another user
const mongoose = require("mongoose");

const shareReelSchema = new mongoose.Schema(
    {
        mainUser: {
            required: true,
            type: mongoose.Types.ObjectId,
            ref: "user"
        },
        sharedUser: {
            required: true,
            type: mongoose.Types.ObjectId,
            ref: "user"
        },
        reelId: {
            type: mongoose.Types.ObjectId,
            ref: "reel",
            required: true,
        },
        // reelUserId: {
        //     type: mongoose.Types.ObjectId,
        //     ref: "user",
        //     required: true,
        // },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("shareReel", shareReelSchema);
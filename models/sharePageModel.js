//share a page to another user
const mongoose = require("mongoose");

const sharePageSchema = new mongoose.Schema(
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
        pageId: {
            type: mongoose.Types.ObjectId,
            ref: "page",
            required: true,
        },

        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("sharePage", sharePageSchema);
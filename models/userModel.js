const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            maxlength: 25,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default:
                "https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png",
        },
        //role: { type: String, default: "user" },
        gender: { type: String, enum: ["male", "female", "other"] },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        address: { type: String, trim: true },
        story: {
            type: String,
            default: "",
            maxlength: 300,
        },
        // website: { type: String, default: "" },
        followers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        following: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        saved: [{ type: mongoose.Types.ObjectId, ref: "user" }],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: { type: Date }
    }, { timestamps: true })

module.exports = mongoose.model("user", userSchema);

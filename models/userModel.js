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
        mail_otp: {         //when a user login after registration, he will be asked to verify his email address
            type: String,
            unique: true,
        },
        otp: {              //when user forgot his password, he will be asked to verify his email address using otp
            type: String,
            unique: true,
        },
        avatar: {
            type: String,
            //required : true,
            default: "https://res.cloudinary.com/dxqjyqz8f/image/upload/v1622021027/avatars/default_avatar.png"
            //s3 link
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
        shared: [{ type: mongoose.Types.ObjectId, ref: "post" }],
        //block user
        block: [{ type: mongoose.Types.ObjectId, ref: "user" }],

        friendRequest: [{ type: mongoose.Types.ObjectId, ref: "user" }],

        friends: [{ type: mongoose.Types.ObjectId, ref: "user" }],

        sentRequest: [{ type: mongoose.Types.ObjectId, ref: "user" }],

        pages: [{ type: mongoose.Types.ObjectId, ref: "page" }],
        //if user organise an event
        events: [{ type: mongoose.Types.ObjectId, ref: "event" }],
       //if user verified then a blue tick will be shown, for varification user will be asked some questions, if he answers correctly then he will be verified automatically
      questions: [{ type: mongoose.Types.ObjectId, ref: "question" }],
        isVerified: {
            type: Boolean,
            default: false,
        },
        
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: { type: Date }
    }, { timestamps: true })

module.exports = mongoose.model("user", userSchema);

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
        mail_otp:{         //when a user login after registration, he will be asked to verify his email address
            type:String,
            unique:true,
          },
        otp:{              //when user forgot his password, he will be asked to verify his email address using otp
            type:String,
            unique:true,
        },
        avatar : {
            type : String,
            //required : true,
            default : "https://res.cloudinary.com/dxqjyqz8f/image/upload/v1622021027/avatars/default_avatar.png"
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
        shared : [{ type: mongoose.Types.ObjectId, ref: "post" }],
        block : [{ type: mongoose.Types.ObjectId, ref: "user" }],
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: { type: Date }
    }, { timestamps: true })

module.exports = mongoose.model("user", userSchema);

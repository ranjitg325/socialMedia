//check the person is online or not whom i am following
const mongoose = require("mongoose");

const checkOnlineSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "user" },
        //if the other user whom i am following is currently using the app then it will be true otherwise false
        isOnline: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("checkOnline", checkOnlineSchema);


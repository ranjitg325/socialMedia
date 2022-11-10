// //create a live single user broadcasting model where other user can join and do chat with broadcaster
// const mongoose = require("mongoose");

// const liveStreamSchema = new mongoose.Schema(
//     {
//       broadcaster: {
//         type: mongoose.Types.ObjectId,
//         ref: "user",
//         required: true,
//         },
//         viewers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
//         likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
//         comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
//         saveLiveStreamAfterBroadcast: {
//             type: Array,
//             //required: true,
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//         deletedAt: {
//             type: Date,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// module.exports = mongoose.model("liveStream", liveStreamSchema);
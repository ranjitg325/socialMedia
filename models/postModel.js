const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: String,
    images: {
      type: Array,
      //required: true,
    },
    support: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
    user: { required : true,type: mongoose.Types.ObjectId, ref: "user" },
    shares : [{ type: mongoose.Types.ObjectId, ref: "user" }],
    sharesCount: { type: Number, default: 0 },
    report : [{ type: mongoose.Types.ObjectId, ref: "user" }],
    isReported : { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", postSchema);

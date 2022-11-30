const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  //at the time of creating post , user can give hashtag and mention and also can give location and share feeling with emoji
  {
    //when a user or admin post within a page then page id will be stored in this field
    page: { type: mongoose.Types.ObjectId, ref: "page" },
    //when a user post within a group then group id will be stored in this field
    //group: { type: mongoose.Types.ObjectId, ref: "group" },

    content: {
      type: String,
      //required: true,
      trim: true,
    },
    images: {
            type: Array,
            //required: true,
          },
    location: {
            coordinates: [],
        },
    feeling: {
      type: String,
      enum: ["happy", "sad", "angry", "love", "bored", "confused", "tired", "surprised", "annoyed", "guilty", "hopeful", "nostalgic", "optimistic", "sick", "stressed", "prepared", "ashamed", "devastated", "furious", "humiliated",  "jealous", "lonely", "miserable", "powerless", "rejected", "anxious", "confident", "content", "curious", "determined", "disappointed", "disgusted", "embarrassed", "excited", "grateful", "impressed", "inspired", "intimidated", "proud", "puzzled", "relaxed", "suspicious", "terrified", "triumphant", "worried"],
    },
    //feeling happy with me and 4 other friends
    feelingWith: [{
      //type: Array,
      type: mongoose.Types.ObjectId,
      ref: "user",
    }],
    //user can give hashtag and mention
    hashtag: {
      type: String,
      trim: true,
      //match: /^#[a-zA-Z0-9]+$/,
      minlength: 2,
      maxlength: 30,
      // validate: {
      //  validator: function (v) {
      //    return /^#[a-zA-Z0-9]+$/.test(v);
      //  },
      //  message: (props) => `${props.value} is not a valid hashtag!`,
      // },
    },
    mention: [{
  //mention is user id using @ symbol
      type: mongoose.Types.ObjectId,
      ref: "user",
    }], 
//   {
//     content: String,
//     images: {
//       type: Array,
//       //required: true,
//     },
    support: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    supportsCount : {type: Number, default: 0},
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    likesCount : {type: Number, default: 0},
    comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
    user: { required: true, type: mongoose.Types.ObjectId, ref: "user" },
    shares: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    sharesCount: { type: Number, default: 0 },
    report: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    isReported: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", postSchema);

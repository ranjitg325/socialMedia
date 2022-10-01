const Comments = require("../models/commentModel");
const Posts = require("../models/postModel");
const userModel = require("../models/userModel");

  exports.createComment= async (req, res) => {
    try {
      const { postId,user,content, tag, reply, postUserId } = req.body;
      const userData = await userModel.findOne({ _id: user});
      if(!userData)
      return res.status(400).json({ msg: "User does not exist." });

      const post = await Posts.findById(postId);
      if (!post)
        return res.status(400).json({ msg: "This post does not exist." });

      if (reply) {
        const cm = await Comments.findById(reply);
        if (!cm)
          return res.status(400).json({ msg: "This comment does not exist." });
      }

      const newComment = new Comments({
        user,   //the person's id , who is going to comment something
        content,
        tag,
        reply,
        postUserId,
        postId,
      });

      await Posts.findOneAndUpdate(
        { _id: postId },
        {
          $push: { comments: newComment._id },
        },
        { new: true }
      );

      await newComment.save();

      res.status(201).send({msg : "comment created" , data: newComment });
    } catch (err) {
      return res.status(500).send({ msg: err.message });
    }
  },
  exports.updateComment= async (req, res) => {
    try {
      const { content } = req.body;

      await Comments.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        { content }
      );

      res.json({ msg: "Update Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.likeComment= async (req, res) => {
    try {
      const comment = await Comments.find({
        _id: req.params.id,
        likes: req.user._id,
      });
      if (comment.length > 0)
        return res.status(400).json({ msg: "You liked this post." });

      await Comments.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { likes: req.user._id },
        },
        { new: true }
      );

      res.json({ msg: "Liked Comment!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.unLikeComment= async (req, res) => {
    try {
      await Comments.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: req.user._id },
        },
        { new: true }
      );

      res.json({ msg: "UnLiked Comment!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.deleteComment= async (req, res) => {
    try {
      const comment = await Comments.findOneAndDelete({
        _id: req.params.id,
        $or: [{ user: req.user._id }, { postUserId: req.user._id }],
      });

      await Posts.findOneAndUpdate(
        { _id: comment.postId },
        {
          $pull: { comments: req.params.id },
        }
      );

      res.json({ msg: "Deleted Comment!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }



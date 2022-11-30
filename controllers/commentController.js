const Comments = require("../models/commentModel.js");
const Posts = require("../models/postModel");
const pages = require("../models/pageModel.js");
const userModel = require("../models/userModel");

exports.createComment = async (req, res) => {
  try {
    const {
      postId,
      content,
      tag,
      reply,
      likes,
      //postUserId 
    } = req.body;

    const post = await Posts.findById(postId);
    if (!post)
      return res.status(400).json({ msg: "This post does not exist." });

    if (reply) {
      const cm = await Comments.findById(reply);
      if (!cm)
        return res.status(400).json({ msg: "This comment does not exist." });
    }

    const newComment = new Comments({
      user: req.user.userId ,   //the person's id , who is going to comment something
      content,
      tag,
      reply,
      likes,
      //postUserId,
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

    res.status(201).send({ msg: "comment created", data: newComment });
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
},
  exports.updateComment = async (req, res) => {
    try {
      const { content } = req.body;
      const commentId = req.params.id;
      const user = req.user.userId;

      const checkUser = await userModel.findOne({_id: user});
      if (!checkUser)
        return res.status(400).json({ msg: "This user does not exist." });

      const updatedComment = await Comments.findByIdAndUpdate(
        {
          //postId: req.params.id,
          _id: commentId,
          user: user,
        },
        { content },
        { new: true }
      );

      res.status(200).send({ msg: "Update Success!", data: updatedComment });
    } catch (err) {
      return res.status(500).send({ msg: err.message });
    }
  },
  exports.likeComment = async (req, res) => {
    try {
      const comment = await Comments.find({
        _id: req.params.id,  //_id = comment id
        likes: req.user.userId // likes = user id
      });
      if (comment.length > 0)
        return res.status(400).json({ msg: "You already liked this post." });

      const like = await Comments.findOneAndUpdate(
        {  _id: req.params.id },
        {
          $push: { likes: req.user.userId },
        },
        { new: true }
      );

      res.json({ msg: "Liked Comment!", data : like });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }

exports.unLikeComment = async (req, res) => {
  try {
    const unlikeComment = await Comments.findOneAndUpdate(
      { _id: req.params.id },   //comment id
      {
        $pull: { likes: req.user.userId },   // id = user id
      },
      { new: true }
    );

    res.json({ msg: "UnLiked Comment!" , data : unlikeComment });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.deleteComment= async (req, res) => {
  try {
    const comment = await Comments.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: req.user.userId }, { postUserId: req.user.userId }],
    });

     await Comments.deleteOne({_id:req.params.id});
     //delete all the replies of the comment
      //await Comments.deleteMany({reply:req.params.id});

      //delete the comment from the post
      await Posts.findOneAndUpdate(
        { comments: req.params.id },
        {
          $pull: { comments: req.params.id },
        },
        { new: true }
      );

//delete the comment from the comment
   const deletedComment= await Posts.findOneAndUpdate(
      { id: comment },
      {
        $pull: { comments: req.params.id  },
      },
      { new: true }
    );
    
    res.json({ msg: "Deleted Comment!" , data :deletedComment});
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}


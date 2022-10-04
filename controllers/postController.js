const Posts = require("../models/postModel");
const Comments = require("../models/commentModel");
const Users = require("../models/userModel");

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.createPost= async (req, res) => {
    try {
      const { content, images } = req.body;

      if (!content) {
        return res.status(400).json({ msg: "Please write something to post." });
      }
      const newPost = new Posts({
        content,
        images,
        user: req.body.userId,
      });
      await newPost.save();

      res.status(201).send({
        msg: "Created Post!",
        newPost: {
          ...newPost._doc,
          user: req.user,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.getPostsOfOwn= async (req, res) => {
    try {
      const features = new APIfeatures(Posts.find({user:req.body._id}), req.query)
        .paginating();
      const posts = await features.query.sort("-createdAt").populate(
        "user likes",
        "avatar username fullname followers following"
      ).populate({
        path: "comments",
        populate: {
          path: "user likes",
          select: "-password",
        },
      });
      res.status(200).send({
        status: "success",
        result: posts.length,
        posts: posts,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  exports.updatePost= async (req, res) => {
    try {
      const { content, images } = req.body;

      const post = await Posts.findOneAndUpdate(
        { _id: req.body.id },  //id=post id
        {
          content,
          images,
        }
      )
        .populate("user likes", "avatar username fullname")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

      res.status(200).send({
        msg: "Updated Post!",
        newPost: {
          ...post._doc,
          content,
          images,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.likePost= async (req, res) => {
    try {
      const post = await Posts.find({
        _id: req.params.id,
        likes: req.body.id,
      });
      if (post.length > 0)
        return res.status(400).json({ msg: "You already liked this post." });

      const like = await Posts.findOneAndUpdate(
        { _id: req.params.id },  //post id
        {
          $push: { likes: req.body.id },  //user id
        },
        { new: true }
      );

      if (!like)
        return res.status(400).json({ msg: "This post does not exist." });

      res.status(200).send({ msg: "Liked Post!" , data: like});
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.unLikePost= async (req, res) => {
    try {
      const like = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      );

      if (!like)
        return res.status(400).json({ msg: "This post does not exist." });

      res.status(200).send({ msg: "UnLiked Post!" , data :like});
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.getUserPosts= async (req, res) => {
    try {
      const features = new APIfeatures(
        Posts.find({ user: req.params.id }),
        req.query
      ).paginating();
      const posts = await features.query.sort("-createdAt");

      res.status(200).send({
        result: posts.length,
        posts    
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // exports.getPost= async (req, res) => {
  //   try {
  //     const post = await Posts.findById(req.params.id)
  //       .populate("user likes", "avatar username fullname followers")
  //       .populate({
  //         path: "comments",
  //         populate: {
  //           path: "user likes",
  //           select: "-password",
  //         },
  //       });

  //     if (!post)
  //       return res.status(400).json({ msg: "This post does not exist." });

  //     res.json({
  //       post,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },
  // exports.getPostsDicover= async (req, res) => {
  //   try {
  //     const newArr = [...req.user.following, req.user._id];

  //     const num = req.query.num || 9;

  //     const posts = await Posts.aggregate([
  //       { $match: { user: { $nin: newArr } } },
  //       { $sample: { size: Number(num) } },
  //     ]);

  //     return res.json({
  //       msg: "Success!",
  //       result: posts.length,
  //       posts,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },
  exports.deletePost= async (req, res) => {
    try {
      const post = await Posts.findOneAndDelete({
        _id: req.params.id,
        user: req.body.id,
      });
      await Comments.deleteMany({ _id: { $in: post.comments } });

      res.status(200).send({
        msg: "Deleted Post!",
        newPost: {
          ...post,
          user: req.user,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  exports.savePost= async (req, res) => {
    try {
      const user = await Users.find({
        _id: req.body.id, //id= user id
        saved: req.params.id,  //id= post id
      });
      if (user.length > 0)
        return res.status(400).json({ msg: "You already saved this post." });

      const save = await Users.findOneAndUpdate(
        { _id: req.body.id },
        {
          $push: { saved: req.params.id },
        },
        { new: true }
      );

      if (!save)
        return res.status(400).json({ msg: "This user does not exist." });

      res.status(200).send({ msg: "Saved Post!", data : save });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  exports.unSavePost= async (req, res) => {
    try {
      const save = await Users.findOneAndUpdate(
        { _id: req.body.id },
        {
          $pull: { saved: req.params.id },
        },
        { new: true }
      );

      if (!save)
        return res.status(400).json({ msg: "This user does not exist." });

      res.status(200).send({ msg: "unSaved Post!", data : save });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // exports.getSavePost= async (req, res) => {
  //   try {
  //     const userId = req.body.id;
  //     const user = await Users.findOne({_id:userId})
  //      .populate("saved");

  //     res.json({
  //       msg: "Success!",
  //       result: user.length,
  //       savePosts: user,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // }
  exports.getSavePost= async (req, res) => {
    try {
      const features = new APIfeatures(
        Users.find({
          _id: { $in: req.body.id },
        }).select("saved /*createdAt*/"),
        req.query
      ).paginating();

      const savePosts = await features.query.sort("-createdAt");

      res.status(200).send({
        result: savePosts.length,
        savePosts
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }


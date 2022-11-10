const Posts = require("../models/postModel");
const Comments = require("../models/commentModel");
const Users = require("../models/userModel");
const aws = require('../aws/aws');
const awsg= require('../awsBucket');
const postModel = require("../models/postModel");

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

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let images = req.files;

    if (!content) {
      return res.status(400).json({ msg: "Please write something to post." });
    }
  if(req.files && req.files.length > 0){
    images = await Promise.all(
      req.files.map(async (file) => {
        return await awsg.uploadToS3(file.buffer);
      })
    );
  }

    const newPost = new Posts({
      content,
      images,
      user: req.user.userId,
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
  exports.getPostsOfOwn = async (req, res) => {
    try {
      const features = new APIfeatures(Posts.find({ user: req.user.userId }), req.query)
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

exports.updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    let images = req.files;

    if (!content) {
      return res.status(400).json({ msg: "Please write something to post." });
    }
  if(req.files && req.files.length > 0){
    images = await Promise.all(
      req.files.map(async (file) => {
        return await awsg.uploadToS3(file.buffer);
      })
    );
  }

  const updatedPost = await Posts.findOneAndUpdate(
    { _id: req.params.id }, //post id
    {
      content,
      images,
      user : req.user.userId,
    },
    { new: true }
  );

  if (!updatedPost)
    return res.status(400).json({ msg: "This post does not exist." });

  res.status(200).send({
    msg: "Updated Post!",
    newPost: {
      ...updatedPost,
      content,
      images,
    },
  });
} catch (err) {
  return res.status(500).json({ msg: err.message });
}
}

// exports.updatePost = async (req, res) => {
//   try {
//     const { content, images } = req.body;

//     const post = await Posts.findOneAndUpdate(
//       { _id: req.body.id },  //id=post id
//       {
//         content,
//         images,
//       }
//     )
//       .populate("user likes", "avatar username fullname")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "user likes",
//           select: "-password",
//         },
//       });

//     res.status(200).send({
//       msg: "Updated Post!",
//       newPost: {
//         ...post,
//         content,
//         images,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// },
  exports.likePost = async (req, res) => {
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

      res.status(200).send({ msg: "Liked Post!", data: like });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
exports.unLikePost = async (req, res) => {
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

    res.status(200).send({ msg: "UnLiked Post!", data: like });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.supportPost = async (req, res) => {
  try {
    const post = await Posts.find({
      _id: req.params.id,  //post id
      support: req.body._id,
    });
    if (post.length > 0)
      return res.status(400).json({ msg: "You already supported this post." });

    const support = await Posts.findOneAndUpdate(
      { _id: req.params.id },  //post id
      {
        $push: { support: req.body._id },  //user id
      },
      { new: true }
    );

    if (!support)
      return res.status(400).json({ msg: "This post does not exist." });

    res.status(200).send({ msg: "supported Post!", data: support });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.unSupportPost = async (req, res) => {
  try {
    const support = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: { support: req.body._id },
      },
      { new: true }
    );

    if (!support)
      return res.status(400).json({ msg: "This post does not exist." });

    res.status(200).send({ msg: "UnLiked Post!", data: support });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.getUserPosts = async (req, res) => {
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
}
// exports.newsFeed= async (req, res) => {
//   try {
//     const features = new APIfeatures(
//       Posts.find({
//         user: [ req.body.user, ...req.body.following ],
//       }),
//       req.query
//     ).paginating();

//     const posts = await features.query
//       .sort("-createdAt")
//       .populate("user likes", "avatar username fullname followers")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "user likes",
//           select: "-password",
//         },
//       });

//     res.json({
//       msg: "Success!",
//       result: posts.length,
//       posts,
//     });
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// }
exports.deletePost = async (req, res) => {
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
exports.savePost = async (req, res) => {
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

    res.status(200).send({ msg: "Saved Post!", data: save });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.unSavePost = async (req, res) => {
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

    res.status(200).send({ msg: "unSaved Post!", data: save });
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
  exports.getSavePost = async (req, res) => {
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

exports.reportPost = async (req, res) => {
  try {
    const post = await Posts.findOne({
      _id: req.params.id,
    });
    if (!post)
      return res.status(400).json({ msg: "This post does not exist." });
    const report = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { report: req.body.id }, $set: { isReported: true } },
      { new: true }
    );

    if (!report)
      return res.status(400).json({ msg: "This post does not exist." });

    res.status(200).send({ msg: "Reported Post", data: report });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.unReportPost = async (req, res) => {
  try {
    const report = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: { report: req.body.id }, $set: { isReported: false },
      },
      { new: true }
    );

    if (!report)
      return res.status(400).json({ msg: "This post does not exist." });

    res.status(200).send({ msg: "Post UnReported", data: report });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

//share post to my timeline
exports.sharePost = async (req, res) => {
  try {
    const user = await Users.find({
      _id: req.body.id, //id= user id
      shared: req.params.id,  //id= post id
    });
    const finduser = await Users.findById(req.body.id);
    if (!finduser) {
      return res.status(400).json({ msg: 'User not found' });
    }
    const findPost = await Posts.findById(req.params.id);
    if (!findPost) {
      return res.status(400).json({ msg: 'post not found' });
    }
    // if (user.length > 0)
    //   return res.status(400).json({ msg: "You already shared this post." });
    const share = await Users.findOneAndUpdate(
      { _id: req.body.id },
      {
        $push: { shared: req.params.id },
      },
      { new: true }
    );

    if (!share)
      return res.status(400).json({ msg: "This user does not exist." });

    res.status(200).send({ msg: "Shared Post", data: share });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.getMySharedPost = async (req, res) => {
  try {
    const userId = req.body.id;
    const user = await Users.findOne({ _id: userId })
      .populate("shared");

    res.status(200).json({
      msg: "Success!",
      sharedPosts: user,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.deleteSharedPost = async (req, res) => {
  try {
    const share = await Users.findOneAndUpdate(
      { _id: req.body.id }, //id= user id
      {
        $pull: { shared: req.params.id },  //id=  post id
      },
      { new: true }
    );

    if (!share)
      return res.status(400).json({ msg: "This user does not exist." });

    res.status(200).send({ msg: "shared Post deleted", data: share });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}


exports.newsFeed = async (req, res) => {
  try {
    const { user } = req.body;
    const findUser = await Users.findById(user);
    if (!findUser) {
      return res.status(400).json({ msg: 'User not found' });
    }
    const allPostOfFollowing = await Posts.find({ user: { $in: findUser.following } })
      .populate("user", "avatar username fullname followers following")
      .sort("-createdAt");
    const allSharedPostOfFollowing = await Users.find({ _id: { $in: findUser.following } })
      .populate("shared", "user likes comments createdAt")
      .select("shared")
      .sort("-createdAt");

    const allPost = [...allPostOfFollowing, ...allSharedPostOfFollowing];
    res.status(200).json({
      msg: "Success!",
      //result: allPost.length,
      data: allPost,
    });
  }
  catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

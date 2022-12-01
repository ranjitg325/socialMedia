const Posts = require("../models/postModel");
const Comments = require("../models/commentModel");
const Users = require("../models/userModel");
const Pages = require("../models/pageModel");
const aws = require('../aws/aws');
const awsg = require('../awsBucket');
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
    const { content, feeling, feelingWith, hashtag, mention } = req.body;
    let images = req.files;

    if (!content && !images) {
      return res.status(400).json({ msg: "Please give either content or image" });
    }
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(async (file) => {
          return await awsg.uploadToS3(file.buffer);
        })
      );
    }

    const newPost = new Posts({
      content,
      images,
      location: {
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      },
      feeling,
      feelingWith,
      hashtag,
      mention,
      user: req.user.userId,
    });

    await newPost.save();

    res.status(201).send({ msg: "Post created", newPost });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
// exports.createPost = async (req, res) => {
//   try {
//     const { content } = req.body;
//     let images = req.files;

//     if (!content) {
//       return res.status(400).json({ msg: "Please write something to post." });
//     }
//     if(req.files && req.files.length > 0){
//       images = await Promise.all(
//         req.files.map(async (file) => {
//           return await awsg.uploadToS3(file.buffer);
//         })
//       );
//     }

//     const newPost = new Posts({
//       content,
//       images,
//       user: req.user.userId,
//     });
//     await newPost.save();

//     res.status(201).send({
//       msg: "Created Post!",
//       newPost: {
//         ...newPost._doc,
//         user: req.user,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// },
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
    if (req.files && req.files.length > 0) {
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
        user: req.user.userId,
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



exports.likePost = async (req, res) => {
  try {
    const post = await Posts.find({
      _id: req.params.id,
      likes: req.user.userId,
    });
    if (post.length > 0)
      return res.status(400).json({ msg: "You already liked this post." });

    const like = await Posts.findOneAndUpdate(
      { _id: req.params.id },  //post id
      {
        $push: { likes: req.user.userId },  //user id
        $inc: { likesCount: 1 },
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
        $pull: { likes: req.user.userId },
        $inc: { likesCount: -1 },
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
      support: req.user.userId,  //user id
    });
    if (post.length > 0)
      return res.status(400).json({ msg: "You already supported this post." });

    const support = await Posts.findOneAndUpdate(
      { _id: req.params.id },  //post id
      {
        $push: { support: req.user.userId },  //user id
        $inc: { supportsCount: 1 },
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
        $pull: { support: req.user.userId },
        $inc: { supportsCount: -1 },
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


exports.deletePost = async (req, res) => {
  try {
    const post = await Posts.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
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
      _id: req.user.userId, //id= user id
      saved: req.params.id,  //id= post id
    });
    if (user.length > 0)
      return res.status(400).json({ msg: "You already saved this post." });

    const save = await Users.findOneAndUpdate(
      { _id: req.user.userId },
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
      { _id: req.user.userId },
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
}


exports.getSavePost = async (req, res) => {
  try {
    const features = new APIfeatures(
      Users.find({
        _id: { $in: req.user.userId },
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
      { $push: { report: req.user.userId }, $set: { isReported: true } },
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
        $pull: { report: req.user.userId }, $set: { isReported: false },
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


exports.sharePost = async (req, res) => {
  try {
    const post = await Posts.findOne({ _id: req.params.id });
    if (!post)
      return res.status(400).json({ msg: "This post does not exist." });

    const share1 = await Users.findOneAndUpdate(
      { _id: req.user.userId },
      {
        $push: { shared: req.params.id },
      },
      { new: true }
    );

    const share = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: { shares: req.user.userId },
        $inc: { sharesCount: 1 },
      },
      { new: true }
    );
    if (!share1)
      return res.status(400).json({ msg: "This user does not exist." });

    if (!share)
      return res.status(400).json({ msg: "This post does not exist." });

    res.status(200).send({ msg: "Post Shared", data: share });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.getMySharedPost = async (req, res) => {
  try {
    const userId = req.user.userId;
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
      { _id: req.user.userId }, //id= user id
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

exports.getTimelinePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Users.findOne({ _id: userId })
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }
    const followingInUsersSchema = await Users.find({ _id: { $in: user.following } })
    const followingPosts = await Posts.find({ user: { $in: followingInUsersSchema } })
    const friendsInUsersSchema = await Users.find({ _id: { $in: user.friends } })
    const friendsPosts = await Posts.find({ user: { $in: friendsInUsersSchema } })
    const pagesInUsersSchema = await Pages.find({ _id: { $in: user.pages } })
    const pagesPosts = await Posts.find({ page: { $in: pagesInUsersSchema } })
    const sharedInUsersSchema = await Users.find({ _id: { $in: user.shared } })
    const sharedPosts = await Posts.find({ user: { $in: sharedInUsersSchema } })
    const allPosts = [...followingPosts, ...friendsPosts, ...pagesPosts, ...sharedPosts].sort((p1, p2) => {
      return new Date(p2.createdAt) - new Date(p1.createdAt);
    });
    res.status(200).json({
      msg: "Success!",
      length: allPosts.length,
      allPosts,
    });
  }
  catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}


exports.getTimelinePostWithoutFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Users.findOne({ _id: userId })
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const allUsers = await Users.find({ _id: { $ne: user._id } })
    const allUsersPosts = await Posts.find({ user: { $in: allUsers } })

    const allPosts = [...allUsersPosts].sort((p1, p2) => {
      return new Date(p2.createdAt) - new Date(p1.createdAt);
    }
    );
    res.status(200).json({
      msg: "Success!",
      length: allPosts.length,
      allPosts,
    });
  }
  catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}



exports.searchPostByHashTag = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Users.findOne({ _id: userId })
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }
    const posts = await Posts.find({ hashtag: { $regex: req.query.hashtag, $options: "i" } })
    res.status(200).json({
      msg: "Success!",
      length: posts.length,
      posts,
    });
  }
  catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

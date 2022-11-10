const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const reelModel = require('../models/reelsModel')
const adminModel = require('../models/adminModel');
const commentModel = require('../models/commentModel');
const notificationModel = require('../models/notificationModel');
//const mongoose = require('mongoose');
const aws = require('../aws/aws');
//const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');
// const { promisify } = require('util');
// const unlinkAsync = promisify(fs.unlink);
// const { validationResult } = require('express-validator');
exports.createReel = async (req, res) => {
    try {
        const { caption } = req.body;
        let video = req.files;
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({  msg: 'User not found' });
        }
        //const reel = await aws.upload(video);
        if (video && video.length > 0) {
            video = await aws.uploadFile(video[0]);
        }
        else {
            return res.status(400).send({ status: false, message: "video is required" })
        }
        const newReel = await new reelModel({
            user: req.body.userId,
            video: video,
            caption,
        });
        await newReel.save();
        res.status(201).json({ message: 'Reel created successfully', data : newReel });
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: err.message });
    }
}

// update the caption of my reel
exports.updateReel = async (req, res) => {
    try {
        const { caption } = req.body;
        const reel = await reelModel.findById(req.params.id); //id= reel id
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (reel.user.toString() !== req.body.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        reel.caption = caption;
        await reel.save();
        res.status(201).json({ message: 'Reel updated successfully', data: reel });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// delete my reel
exports.deleteReel = async (req, res) => {
    try {
        const reel = await reelModel.findById(req.params.id);
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (reel.user.toString() !== req.body.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
      const deletedReel = await reelModel.findOneAndUpdate({_id: req.params.id}, {isDeleted: true, deletedAt: Date.now()}, {new: true});
        res.status(201).json({ message: 'Reel deleted successfully', data: deletedReel });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// get all reels of my following users
// exports.getFollowingReels = async (req, res) => {
//     try {
//         const user = await userModel.findById(req.body.userId);
//         if (!user) {
//             return res.status(400).json({ msg: 'User not found' });
//         }
//         const reels = await reelModel.find({ user: { $in: user.following } }).populate('user', ['name', 'username', 'avatar']);
//         res.status(200).json({ message: 'Following reels fetched successfully', data: reels });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ msg: err.message });
//     }
// }

// get my all reels
exports.getMyReels = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId)
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reelsCount = await reelModel.find({ user: req.body.userId }).populate('user', ['name', 'username', 'avatar']).count();
        const reels = await reelModel.find({ user: req.body.userId }).populate('user', ['name', 'username', 'avatar']);
        res.status(200).json({ message: 'My reels fetched successfully',"count" :reelsCount, data: reels });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// get all reels
exports.getAllReels = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reels = await reelModel.find({isDeleted: false}).populate('user', ['name', 'username', 'avatar']);
        res.status(200).json({ message: 'All reels fetched successfully', data: reels });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}


exports.searchReels = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reels = await reelModel.find({ caption: { $regex: req.body.caption, $options: 'i' }, isDeleted : false }).populate('user', ['name', 'username', 'avatar']);
        res.status(200).json({ message: 'Reels fetched successfully', data: reels });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// like a reel
exports.likeReel = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reel = await reelModel.findById(req.params.id);
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        if (reel.likes.includes(req.body.userId)) {
            return res.status(400).json({ msg: 'You already liked this post' });
        }
        await reel.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json({ message: 'Reel liked successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// unlike a reel
exports.unlikeReel = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reel = await reelModel.findById(req.params.id);
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        if (!reel.likes.includes(req.body.userId)) {
            return res.status(400).json({ msg: 'You have not liked this post' });
        }
        await reel.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json({ message: 'Reel unliked successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// save a reel
exports.saveReel = async (req, res) => {
    try {
        const user = await userModel.find({
            _id: req.body.userId,
            saved: req.params.id         
        });
        const checkUser = await userModel.findById(req.body.userId);
        if (!checkUser) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reel = await reelModel.findById(req.params.id);
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        if (user.length > 0)
        return res.status(400).json({ msg: "You already saved this reel." });

        const save = await userModel.findOneAndUpdate(
            { _id: req.body.userId },
            {
              $push: { saved: req.params.id },
            },
            { new: true }
          );
          if (!save)
          return res.status(400).json({ msg: "This user does not exist." });
          res.status(200).send({ msg: "Saved reel", data : save });
        } catch (err) {
          return res.status(500).json({ msg: err.message });
        }
      };

// unsave a reel
exports.unsaveReel = async (req, res) => {
    try {
        const user = await userModel.find({
            _id: req.body.userId,
            saved: req.params.id         
        });
        const checkUser = await userModel.findById(req.body.userId);
        if (!checkUser) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reel = await reelModel.findById(req.params.id);
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        if (user.length == 0)
        return res.status(400).json({ msg: "You have not saved this reel." });

        const save = await userModel.findOneAndUpdate(
            { _id: req.body.userId },
            {
              $pull: { saved: req.params.id },
            },
            { new: true }
          );
          if (!save)
          return res.status(400).json({ msg: "This user does not exist." });
          res.status(200).send({ msg: "Unsaved reel", data : save });
        } catch (err) {
          return res.status(500).json({ msg: err.message });
        }
      };

// get saved reels
exports.getSavedReels = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reels = await reelModel.find({ _id: { $in: user.saved } }).populate('user', ['name', 'username', 'avatar']);
        res.status(200).json({ message: 'Saved reels fetched successfully', data: reels });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// get reels of a user
exports.getUserReels = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reels = await reelModel.find({ user: req.params.id, isDeleted : false }).populate('user', ['name', 'username', 'avatar']);
        res.status(200).json({ message: 'User reels fetched successfully', data: reels });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// report a reel
exports.reportReel = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reel = await reelModel.findOne({_id:req.params.id});
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        //const updateReel= await reelModel.findByIdAndUpdate({ $push: { report: req.body.userId }, $set: { isReported: true } }, { new: true });
        const updateReel = await reelModel.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { report: req.body.userId }, $set : {isReported : true} },
            { new: true }
          );
        res.status(200).json({ message: 'Reel reported successfully', data :updateReel });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}

// get reported reels   //can be used by admin only
exports.getReportedReels = async (req, res) => {
    try {
        const user = await adminModel.findById({_id: req.body.id});
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reels = await reelModel.find({ isReported: true, isDeleted : false }).populate('user', ['name', 'username', 'avatar']);
        res.status(200).json({ message: 'Reported reels fetched successfully', data: reels });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}


// share a reel
exports.shareReel = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const reel = await reelModel.findById(req.params.id);
        if (!reel) {
            return res.status(400).json({ msg: 'Reel not found' });
        }
        const updateReel = await reelModel.findOneAndUpdate(
            { _id: req.params.id },
           
            { $inc: { sharesCount: 1 } },
            //{ $push: { shares: req.body.userId } },
            { new: true }
          );
        res.status(200).json({ message: 'Reel shared successfully', data :updateReel });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: err.message });
    }
}


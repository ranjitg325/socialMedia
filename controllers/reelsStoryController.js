//story for 24 hours only
const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const storyModel = require('../models/reelsStoryModel');
const commentModel = require('../models/commentModel');
const aws = require('../aws/aws');


exports.createStory = async (req, res) => {
    try {
        if (req.files && req.files.length > 0) {
        const { caption } = req.body;
        let media = req.files;
        // const findUser = await userModel.findById(user);
        // if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

        if (media && media.length > 0) {
            media = await aws.uploadFile(media[0]);
        }
        else {
            return res.status(400).send({ status: false, message: "media is required" })
        }

        const newStory = await new storyModel({
            user: req.user.userId,
            media,
            caption,
        });

        await newStory.save();

        setTimeout(async () => {
            await storyModel.findOneAndDelete({ _id: newStory._id });
        }, 86400000); //1000 milisecond = 1 second

        res.status(201).send({ msg: 'Story created', data: newStory });
    }
    else {
        const { caption } = req.body;
        // const findUser = await userModel.findById(user);
        // if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

        const newStory = await new storyModel({
            user: req.user.userId,
            caption,
        });

        await newStory.save();

        setTimeout(async () => {
            await storyModel.findOneAndDelete({ _id: newStory._id });
        }, 86400000); //1000 milisecond = 1 second

        res.status(201).send({ msg: 'Story created', data: newStory });
    }
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}
//     try {
//         const { caption, user } = req.body;
//         let media = req.files;
//         const findUser = await userModel.findById(user);
//         if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

//         if (media && media.length > 0) {
//             media = await aws.uploadFile(media[0]);
//         }
//         else {
//             return res.status(400).send({ status: false, message: "media is required" })
//         }

//         const newStory = await new storyModel({
//             user: user,
//             media,
//             caption,
//         });

//         await newStory.save();

//         //set timeout for 24 hours
//         setTimeout(async () => {
//             await storyModel.findOneAndUpdate(
//                 { _id: newStory._id },
//                 {
//                     isDeleted: true,
//                     deletedAt: Date.now(),
//                 },
//                 { new: true }
//             );
//         }, 86400000);

//         res.status(201).send({ msg: 'Story created', data: newStory });
//     } catch (err) {
//         return res.status(500).send({ msg: err.message });
//     }
// }


exports.getStories = async (req, res) => {
    try {
        const user = req.user.userId;
        const findUser = await userModel.findById(user);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });
        const reels = await storyModel.find({ user: { $in: [...findUser.following, ...findUser.friends, ...findUser.pages] }, isDeleted: false })
        res.status(200).send({ msg: 'Reels fetched', data: reels });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


exports.getMyStories = async (req, res) => {
    try {
        const user = req.user.userId;
        const findUser = await userModel.findById(user);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

        const stories = await storyModel.find({ user: user, isDeleted: false })
        res.status(200).send({ msg: 'Stories fetched', data: stories });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


//delete my story
exports.deleteStory = async (req, res) => {
    try {
        const user = req.user.userId;
        const findUser = await userModel.findById(user);
        if (!findUser) return res.status(400).json({ msg: 'User does not exist.' });

        const story = await storyModel.findById(req.params.id);
        if (!story) return res.status(400).json({ msg: 'Story does not exist.' });

        if (story.user.toString() !== user) return res.status(400).json({ msg: 'You are not authorized to delete this story.' });

       const deletedStory= await storyModel.findOneAndDelete({ _id: req.params.id });
        res.status(200).send({ msg: 'Story deleted', data: deletedStory });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}
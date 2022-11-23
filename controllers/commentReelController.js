const commentReelModel = require('../models/commentReelModel');
const reelModel = require('../models/reelsModel');
const userModel = require('../models/userModel');

exports.createCommentReel = async (req, res) => {
    try {
        const { reelId, content, tag, reply, likes, reelUserId } = req.body;
    
        const reel = await reelModel.findById(reelId);
        if (!reel)
            return res.status(400).json({ msg: 'This reel does not exist.' });

        if (reply) {
            const cm = await commentReelModel.findById(reply);
            if (!cm)
                return res.status(400).json({ msg: 'This comment does not exist.' });
        }

        const newComment = new commentReelModel({
            user:req.user.userId , //the person's id , who is going to comment something
            content,
            tag,
            reply,
            likes,
            reelUserId,
            reelId,
        });

        await reelModel.findOneAndUpdate(
            { _id: reelId },
            {
                $push: { comments: newComment._id },
            },
            { new: true }
        );

        await newComment.save();

        res.status(201).send({ msg: 'comment created', data: newComment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.updateCommentReel = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'User does not exist.' });

        const comment = await commentReelModel.findById(commentId);
        if (!comment)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (comment.user.toString() !== user)
            return res.status(400).json({ msg: 'You can update only your comment.' });

        await commentReelModel.findOneAndUpdate(
            { _id: commentId },
            {
                content,
            },
            { new: true }
        );

        res.status(201).send({ msg: 'comment updated', data: comment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.deleteCommentReel = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'User does not exist.' });

        const comment = await commentReelModel.findById(commentId);
        if (!comment)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (comment.user.toString() !== user)
            return res.status(400).json({ msg: 'You can delete only your comment.' });

        await commentReelModel.findOneAndDelete({ _id: commentId });

        await reelModel.findOneAndUpdate(
            { _id: comment.reelId },
            {
                $pull: { comments: commentId },
            },
            { new: true }
        );

        res.status(200).send({ msg: 'comment deleted', data: comment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.likeCommentReel = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'User does not exist.' });

        const comment = await commentReelModel.findById(commentId);
        if (!comment)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (comment.likes.includes(user))
            return res.status(400).json({ msg: 'You already liked this comment.' });

        await commentReelModel.findOneAndUpdate(
            { _id: commentId },
            {
                $push: { likes: user },
            },
            { new: true }
        );

        res.status(201).send({ msg: 'comment liked', data: comment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.unlikeCommentReel = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'User does not exist.' });

        const comment = await commentReelModel.findById(commentId);
        if (!comment)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (!comment.likes.includes(user))
            return res.status(400).json({ msg: 'You can not unlike this comment.' });

        await commentReelModel.findOneAndUpdate(
            { _id: commentId },
            {
                $pull: { likes: user },
            },
            { new: true }
        );

        res.status(201).send({ msg: 'comment unliked', data: comment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


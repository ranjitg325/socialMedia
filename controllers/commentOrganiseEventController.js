const organiseEventCommentModel = require('../models/organiseEventCommentModel');
const userModel = require('../models/userModel');
const organiseEventModel = require('../models/organiseEventModel');

exports.createComment = async (req, res) => {
    try {
        const {
            eventId,
            content,
            tag,
            reply,
            likes,
        } = req.body;

        const event = await organiseEventModel.findById(eventId);
        if (!event)
            return res.status(400).json({ msg: 'This event does not exist.' });

        if (reply) {
            const cm = await organiseEventCommentModel.findById(reply);
            if (!cm)
                return res.status(400).json({ msg: 'This comment does not exist.' });
        }

        const newComment = new organiseEventCommentModel({
            user: req.user.userId,   //the person's id , who is going to comment something
            content,
            tag,
            reply,
            likes,
            eventId,
        });

        await organiseEventModel.findOneAndUpdate(
            { _id: eventId },
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

//only the user who created the comment can update it
exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'This user does not exist.' });
        const comment = await organiseEventCommentModel.findOne({ _id: commentId });
        if (!comment)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (comment.user.toString() !== user) {
            return res.status(400).json({ msg: 'You are not the owner of this comment.' });
        }

        const updatedComment = await organiseEventCommentModel.findByIdAndUpdate(
            {
                _id: commentId,
                user: user,
            },
            {
                content,
            },
            { new: true }
        );

        res.status(200).send({ msg: 'comment updated', data: updatedComment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//like a comment
exports.likeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'This user does not exist.' });
        const comments = await organiseEventCommentModel.findOne({ _id: commentId });
        if (!comments)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (comments.likes.find((id) => id.toString() === user)) {
            return res.status(400).json({ msg: 'You already liked this comment.' });
        }

       const liked=  await organiseEventCommentModel.findOneAndUpdate(
            { _id: commentId },
            {
                $push: { likes: user },
            },
            { new: true }
        );
            
        res.status(200).send({ msg: 'comment liked', data: liked });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//unlike a comment
exports.unlikeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'This user does not exist.' });
        const comments = await organiseEventCommentModel.findOne({ _id: commentId });
        if (!comments)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (!comments.likes.find((id) => id.toString() === user)) {
            return res.status(400).json({ msg: 'You have not liked this comment yet.' });
        }

        const unliked = await organiseEventCommentModel.findOneAndUpdate(
             { _id: commentId },
                {
                    $pull: { likes: user },
                },
                { new: true }
            );

        res.status(200).send({ msg: 'comment unliked', data: unliked });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const user = req.user.userId;

        const checkUser = await userModel.findOne({ _id: user });
        if (!checkUser)
            return res.status(400).json({ msg: 'This user does not exist.' });
        const comment = await organiseEventCommentModel.findOne({ _id: commentId });
        if (!comment)
            return res.status(400).json({ msg: 'This comment does not exist.' });

        if (comment.user.toString() !== user) {
            return res.status(400).json({ msg: 'You are not the owner of this comment.' });
        }
        await organiseEventModel.findOneAndUpdate(
            { _id: comment.eventId },
            {
                $pull: { comments: commentId },
            },
            { new: true }
        );
            
       const deleteComment = await organiseEventCommentModel.findByIdAndDelete(commentId);
            
        return res.status(200).send({ msg: 'comment deleted', data : deleteComment });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}
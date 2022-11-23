const userModel = require('../models/userModel');
const reelModel = require('../models/reelsModel');
const shareReelModel = require('../models/shareReelModel');

exports.shareReel = async (req, res) => {
    try {
        const { /*mainUser,*/ sharedUser, reelId /*,reelUserId*/ } = req.body;
        // const mainUserData = await userModel.findOne({ _id: mainUser });
        // if (!mainUserData)
        //     return res.status(400).json({ msg: 'mainUserData does not exist.' });

        const sharedUserData = await userModel.findOne({ _id: sharedUser });
        if (!sharedUserData)
            return res.status(400).json({ msg: 'sharedUserData does not exist.' });

        const reel = await reelModel.findById(reelId);
        if (!reel)
            return res.status(400).json({ msg: 'This reel does not exist.' });

        const newShareReel = new shareReelModel({
            mainUser: req.user.userId, //the person's id , who is going to share something
            sharedUser,
            reelId,
            /*reelUserId,*/
        });
      await reelModel.findOneAndUpdate(
            { _id: reelId },
            {
                $push: { shares: newShareReel._id },
                $inc: { sharesCount: 1 },
            },  
            { new: true }
        );

        await newShareReel.save();

        res.status(201).send({ msg: 'reel shared', data: newShareReel });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}
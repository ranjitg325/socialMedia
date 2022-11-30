const sharePageModel = require("../models/sharePageModel");
const pageModel = require("../models/pageModel");
const userModel = require("../models/userModel");

exports.sharePage = async (req, res) => {
  try {
    const { sharedUser, pageId } = req.body;
    const sharedUserData = await userModel.findOne({ _id: sharedUser });
    if (!sharedUserData)
      return res.status(400).json({ msg: "sharedUserData does not exist." });

    const page = await pageModel.findById(pageId);
    if (!page)
      return res.status(400).json({ msg: "This page does not exist." });

    const newSharePage = new sharePageModel({
      mainUser: req.user.userId, //the person's id , who is going to share something
      sharedUser,
      pageId,
    });
    await pageModel.findOneAndUpdate(
        { _id: pageId },
        {
          $push: { shares: newSharePage._id },
          $inc: { sharesCount: 1 },
        },
        { new: true }
        );

    await newSharePage.save();

    res.status(201).send({ msg: "page shared", data: newSharePage });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
        }
    }
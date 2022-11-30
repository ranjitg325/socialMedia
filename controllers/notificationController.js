const Notifies = require("../models/notificationModel");
const aws= require('../awsBucket');

  exports.createNotify=async (req, res) => {
    try {
      const {id,recipients, url, text, content } = req.body;
      if (recipients.includes(req.user.userId.toString())) return;

      let image = req.files;
      if(req.files && req.files.length > 0){
        image = await Promise.all(
          req.files.map(async (file) => {
            return await aws.uploadToS3(file.buffer);
          })
        );
      }
      const notify = new Notifies({
        id,
        recipients,
        url,
        text,
        content,
        image,
        user: req.user.userId,
      });

      await notify.save();
      return res.status(201).json({ notify });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }

  exports.removeNotify= async (req, res) => {
    try {
      const notify = await Notifies.findOneAndDelete({
        id: req.params.id,
        url: req.query.url,
      });

      return res.status(200).send({ data : notify });
    } catch (err) {
      return res.status(500).send({ msg: err.message });
    }
  }
  exports.getNotifies= async (req, res) => {
    try {
      const notifies = await Notifies.find({ recipients: req.user.userId, })
        .sort("-createdAt")
        .populate("user", "avatar username");

      return res.status(200).json({ data: notifies });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  exports.isReadNotify= async (req, res) => {
    try {
      const notifies = await Notifies.findOneAndUpdate(
        { _id: req.params.id },
        {
          isRead: true,
        }
      );

      return res.status(200).json({ notifies });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
  exports.deleteAllNotifies= async (req, res) => {
    try {
      const notifies = await Notifies.deleteMany({ recipients: req.user.userId });

      return res.status(200).json({ notifies });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }


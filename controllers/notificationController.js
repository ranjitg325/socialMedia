const Notifies = require("../models/notificationModel");


  exports.createNotify=async (req, res) => {
    try {
      const {recipients, url, text, content, image } = req.body;

      //if (recipients.includes(req.body._id.toString())) return;

      const notify = new Notifies({
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
        _id: req.user.userId,
       // url: req.body.url,
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
        { _id: req.user.userId, },
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


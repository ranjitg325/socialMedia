const Conversations = require("../models/conversationModel");
const Messages = require("../models/messageModel");

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

exports.createMessage = async (req, res) => {
  try {
    const { sender, recipient, text, media, call } = req.body;

    if (!recipient || (!text.trim() && media.length === 0 && !call)) return;

    const newConversation = await Conversations.findOneAndUpdate(
      {
        $or: [
          { recipients: [sender, recipient] },
          { recipients: [recipient, sender] },
        ],
      },
      {
        recipients: [sender, recipient],
        text,
        media,
        call,
      },
      { new: true, upsert: true }
    );

    const newMessage = new Messages({
      conversation: newConversation._id,
      sender,
      call,
      recipient,
      text,
      media,
    });

    await newMessage.save();

    res.json({ msg: "Create Success!", data: newMessage });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.getConversations = async (req, res) => {
  try {
    const features = new APIfeatures(
      Conversations.find({
        recipients: req.body._id,
      }),
      req.query
    ).paginating();

    const conversations = await features.query
      .sort("-updatedAt")
      .populate("recipients", "avatar username fullname");

    res.json({
      result: conversations.length,
      conversations
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.getMessages = async (req, res) => {
  try {
    const features = new APIfeatures(
      Messages.find({
        $or: [
          { sender: req.body._id, recipient: req.params.id },
          { sender: req.params.id, recipient: req.body._id },
        ],
      }),
      req.query
    ).paginating();

    const messages = await features.query.sort("-createdAt");

    res.json({
      result: messages.length,
      messages,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.deleteMessages = async (req, res) => {
  try {
    const deleteMsg = await Messages.findOneAndDelete({
      _id: req.params.id, //id= message id
      sender: req.body._id,
    });
    res.json({ msg: "Delete Success!", data: deleteMsg });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.deleteConversation = async (req, res) => {
  try {
    const recipientsData = await Conversations.findOne({ recipients: req.body._id }); //in recipients provide only recipient id not the sender id
    if (!recipientsData) {
      return res.status(400).send({ message: "not a valid user" });
    }
    const newConver = await Conversations.findOneAndDelete({
      _id: req.params.id, //id= conversation id
      recipients: req.body._id,
    });
    const recipientData = await Messages.findOne({ recipient: req.body._id });
    if (!recipientData) {
      return res.status(400).send({ message: "not valid user" });
    }
    await Messages.deleteMany({ recipient: req.body._id, conversation: req.params.id });

    res.json({ msg: "Delete Success!", data: newConver });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}


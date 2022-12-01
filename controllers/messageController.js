const Conversations = require("../models/conversationModel");
const Messages = require("../models/messageModel");
const Users = require("../models/userModel");

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
        recipients: req.user.userId,
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
          { sender: req.user.userId, recipient: req.params.id },
          { sender: req.params.id, recipient: req.user.userId },
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
      sender: req.user.userId,
    });
    res.json({ msg: "Delete Success!", data: deleteMsg });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
exports.deleteConversation = async (req, res) => {
  try {
    const recipientsData = await Conversations.findOne({ recipients: req.user.userId }); //in recipients provide only recipient id not the sender id
    if (!recipientsData) {
      return res.status(400).send({ message: "not a valid user" });
    }
    const newConver = await Conversations.findOneAndDelete({
      _id: req.params.id, //id= conversation id
      recipients: req.user.userId,
    });
    const recipientData = await Messages.findOne({ recipient: req.user.userId });
    if (!recipientData) {
      return res.status(400).send({ message: "not valid user" });
    }
    await Messages.deleteMany({ recipient: req.user.userId, conversation: req.params.id });

    res.json({ msg: "Delete Success!", data: newConver });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}


exports.createGroup = async (req, res) => {
  try {
    const { groupName, recipients } = req.body;
    if (recipients.length === 0)
      return res.status(400).json({ msg: "Please add people." });

const verifyUserIds = await Users.find({ _id: { $in: recipients } });
    if (verifyUserIds.length !== recipients.length)
      return res.status(400).json({ msg: "Please add valid people." });
//group creator will be added automatically
const newGroup = new Conversations({
      recipients: [...recipients, req.user.userId],
      groupName,
      isGroup: true,
    });

    await newGroup.save();

    return res.json({ msg: "Create Success", data: newGroup });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.groupChat = async (req, res) => {
  try {
    const { groupName, sender, text, media, call } = req.body;
    
    if(!groupName) return res.status(400).json({msg: "group is not found"})
    const newConversation = await Conversations.findOneAndUpdate(
      { groupName },
      { text, media, call },
      { new: true }
    );
    if (!newConversation)
      return res.status(400).json({ msg: "This group does not exist." });

    if (!newConversation.recipients.includes(sender))
      return res.status(400).json({ msg: "You are not a part of this group,so you can't do message" });

    const newMessage = new Messages({
      conversation: newConversation._id,
      sender,
      call,
      text,
      media,
    });

    await newMessage.save();

    res.status(200).json({ msg: "Create Success", data: newMessage });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.updateGroupName = async (req, res) => {
  try {
    const { groupName } = req.body;
    if (!groupName) return res.status(400).json({ msg: "group name required" });
    const updateGroup = await Conversations.findOneAndUpdate(
      {
        _id: req.params.id,   //id=conversation id
        isGroup: true,
      },
      { groupName },
      { new: true }
    );
    res.json({ msg: "Update Success!", data: updateGroup });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.getGroupMembers = async (req, res) => {
  try {
    const group = await Conversations.findOne({
      _id: req.params.id,
      isGroup: true,
    }).select("recipients");
    res.status(200).json({ msg: "Get Success", data: group });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.getGroupMembersCount = async (req, res) => {
  try {
    const group = await Conversations.findOne({
      _id: req.params.id,
      isGroup: true,
    }).select("recipients");
    res.status(200).json({ msg: "Get Success", data: group.recipients.length });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

exports.getGroupMessages = async (req, res) => {
  try {
    const features = new APIfeatures(
      Messages.find({
        conversation: req.params.id,
      }),
      req.query
    ).paginating();

    const messages = await features.query.sort("createdAt");

    res.status(200).json({
      result: messages.length,
      messages,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
//user can delete only his own message
// exports.deleteGroupMessages = async (req, res) => {
//   try {
//     const deleteGroupMsg = await Messages.findOneAndDelete({
//       _id: req.params.id, //id= message id
//       conversation: req.body._id,
//       sender: req.body.id
//     });
//     res.json({ msg: "Delete Success!", data: deleteGroupMsg });
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// }

//exit from group
exports.exitGroup = async (req, res) => {
  try {
    const exitGroup = await Conversations.findOneAndUpdate(
      {
        _id: req.params.id, //id=conversation id
        isGroup: true,
      },
      { $pull: { recipients: req.user.userId } },
      { new: true }
    );
    res.json({ msg: "Exit Success!", data: exitGroup });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}


//add group member
exports.addMemberToGroup = async (req, res) => {
  try {
    const { recipients } = req.body;
    if (recipients.length === 0)
      return res.status(400).json({ msg: "Please add people." });

    const verifyUserIds = await Users.find({ _id: { $in: recipients } });
    if(!verifyUserIds) 
    return res.status(400).json({ msg: "Please add valid people." });

      if(!req.user.userId)
      return res.status(400).json({ msg: "creater id required" });

    const group = await Conversations.findOne({
      _id: req.params.id,
      isGroup: true,
    }).select("recipients");
    if (group.recipients.includes(recipients))
      return res.status(400).json({ msg: "this user is Already added in group" });


    const addGroupMembers = await Conversations.findOneAndUpdate(
      {
        _id: req.params.id, //id=conversation id
        isGroup: true,
        creator: req.user.userId, //id=user id(the user who is going to add members)
      },
      { $push: { recipients: recipients } },
      { new: true }
    );
    
    res.json({ msg: "Add Success!", data: addGroupMembers });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

//remove group member by group creator only
exports.removeMemberFromGroup = async (req, res) => {
  try {
    const { recipients } = req.body;
      if(!req.user.userId)
      return res.status(400).json({ msg: "creater id required" });

    const group = await Conversations.findOne({
      _id: req.params.id,
      isGroup: true,
    }).select("recipients");
    if (!group.recipients.includes(recipients))
      return res.status(400).json({ msg: "this user is not in group" });


    const removeMemberFromGroup = await Conversations.findOneAndUpdate(  
      {
        _id: req.params.id, //id=conversation id
        isGroup: true,
        creator: req.user.userId, //id=user id(the user who is going to remove members)
      },
      { $pull: { recipients: recipients } },
      { new: true }
    );
    
    res.json({ msg: "Remove Success!", data: removeMemberFromGroup });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}




const express = require('express');
const router = express.Router();

const messageController = require("../controllers/messageController")
//const middleware = require("../middleware/authenticateUser");

router.post("/createMessage",  messageController.createMessage);

router.get("/getConversations",  messageController.getConversations);

router.get("/getMessage/:id",  messageController.getMessages);

router.delete("/deleteMessage/:id",  messageController.deleteMessages);

router.delete("/deleteConversationChat/:id",  messageController.deleteConversation);

//router.patch("/isReadMessage", messageController.isReadMessage);

router.post("/createGroup",  messageController.createGroup);

router.post("/groupChat", messageController.groupChat);

router.put("/updateGroupName/:id",  messageController.updateGroupName);

router.get("/getGroupMembers/:id",  messageController.getGroupMembers);

router.get("/getGroupMembersCount/:id",  messageController.getGroupMembersCount);

router.get("/getGroupMessages/:id", messageController.getGroupMessages);

router.delete("/deleteGroupMessages/:id",  messageController.deleteGroupMessages);

router.put("/exitGroup/:id",  messageController.exitGroup);

router.put("/addMemberToGroup/:id", messageController.addMemberToGroup);

router.put("/removeMemberFromGroup/:id",  messageController.removeMemberFromGroup);
module.exports = router;

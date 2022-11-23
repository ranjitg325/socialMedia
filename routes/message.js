const express = require('express');
const router = express.Router();

const messageController = require("../controllers/messageController")
const middleware = require("../middleware/authenticateUser");

router.post("/createMessage", middleware.authenticateToken, messageController.createMessage);

router.get("/getConversations", middleware.authenticateToken, messageController.getConversations);

router.get("/getMessage/:id",middleware.authenticateToken,  messageController.getMessages);

router.delete("/deleteMessage/:id",middleware.authenticateToken,  messageController.deleteMessages);

router.delete("/deleteConversationChat/:id",middleware.authenticateToken,  messageController.deleteConversation);

//router.patch("/isReadMessage", messageController.isReadMessage);

router.post("/createGroup", middleware.authenticateToken, messageController.createGroup);

router.post("/groupChat",middleware.authenticateToken, messageController.groupChat);

router.put("/updateGroupName/:id",middleware.authenticateToken,  messageController.updateGroupName);

router.get("/getGroupMembers/:id",middleware.authenticateToken,  messageController.getGroupMembers);

router.get("/getGroupMembersCount/:id", middleware.authenticateToken, messageController.getGroupMembersCount);

router.get("/getGroupMessages/:id",middleware.authenticateToken, messageController.getGroupMessages);

//router.delete("/deleteGroupMessages/:id",  messageController.deleteGroupMessages);

router.put("/exitGroup/:id", middleware.authenticateToken, messageController.exitGroup);

router.put("/addMemberToGroup/:id",middleware.authenticateToken, messageController.addMemberToGroup);

router.put("/removeMemberFromGroup/:id", middleware.authenticateToken, messageController.removeMemberFromGroup);
module.exports = router;

const express = require('express');
const router = express.Router();

const messageController = require("../controllers/messageController");
//const auth = require("../middleware/auth");

router.post("/createMessage", messageController.createMessage);

router.get("/getConversations", messageController.getConversations);

router.get("/getMessage/:id", messageController.getMessages);

router.delete("/deleteMessage/:id", messageController.deleteMessages);

router.delete("/deleteConversationChat/:id", messageController.deleteConversation);

module.exports = router;

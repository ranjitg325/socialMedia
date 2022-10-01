const express = require('express');
const router = express.Router();

const commentController = require("../controllers/commentController");
//const auth = require("../middleware/authenticateUser");

router.post("/comment", commentController.createComment);

router.patch("/comment/:id", commentController.updateComment);

router.patch("/comment/:id/like", commentController.likeComment);

router.patch("/comment/:id/unlike", commentController.unLikeComment);

router.delete("/comment/:id", commentController.deleteComment);

module.exports = router;

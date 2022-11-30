const express = require('express');
const router = express.Router();

const commentController = require("../controllers/commentController");
const middleware = require("../middleware/authenticateUser");

router.post("/comment", middleware.authenticateToken,  commentController.createComment);

router.put("/comment/:id",  middleware.authenticateToken, commentController.updateComment);

router.patch("/likeComment/:id", middleware.authenticateToken,  commentController.likeComment);

router.patch("/unlikeComment/:id", middleware.authenticateToken,  commentController.unLikeComment);

router.delete("/comment/:id", middleware.authenticateToken,  commentController.deleteComment);

module.exports = router;
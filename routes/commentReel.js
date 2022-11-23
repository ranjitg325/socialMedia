const express = require('express');
const router = express.Router();

const commentReelController = require("../controllers/commentReelController");
const middleware = require("../middleware/authenticateUser");

router.post("/commentReel",middleware.authenticateToken,  commentReelController.createCommentReel);

router.put("/updateCommentReel/:id",middleware.authenticateToken,  commentReelController.updateCommentReel);

router.put("/likeCommentReel/:id", middleware.authenticateToken, commentReelController.likeCommentReel);

router.put("/unlikeCommentReel/:id", middleware.authenticateToken, commentReelController.unlikeCommentReel);

router.delete("/deleteCommentReel/:id", middleware.authenticateToken, commentReelController.deleteCommentReel);

module.exports = router;


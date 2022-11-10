const express = require('express');
const router = express.Router();

const commentReelController = require("../controllers/commentReelController");
//const middleware = require("../middleware/authenticateUser");

router.post("/commentReel",  commentReelController.createCommentReel);

router.put("/updateCommentReel/:id",  commentReelController.updateCommentReel);

router.put("/likeCommentReel/:id",  commentReelController.likeCommentReel);

router.put("/unlikeCommentReel/:id",  commentReelController.unlikeCommentReel);

router.delete("/deleteCommentReel/:id",  commentReelController.deleteCommentReel);

module.exports = router;


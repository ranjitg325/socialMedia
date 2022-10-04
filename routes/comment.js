const express = require('express');
const router = express.Router();

const commentController = require("../controllers/commentController");
//const auth = require("../middleware/authenticateUser");

router.post("/comment", commentController.createComment);

router.put("/comment/:id", commentController.updateComment);

router.patch("/likeComment/:id", commentController.likeComment);

router.put("/unlikeComment/:id", commentController.unLikeComment);

router.delete("/comment/:id", commentController.deleteComment);

module.exports = router;

const express = require('express');
const router = express.Router();

const postController = require("../controllers/postController");
//const auth = require("../middleware/authenticateUser");

router.post("/posts", postController.createPost);

router.get("/getMyPosts", postController.getPostsOfOwn);  //done by user only means my profile

router.put("/updatePost", postController.updatePost);

//router.get("/newsFeed", postController.newsFeed);

router.delete("/deletePost/:id", postController.deletePost);

router.patch("/likePost/:id", postController.likePost);

router.patch("/unlikepost/:id", postController.unLikePost);

router.patch("/supportPost/:id", postController.supportPost);

router.patch("/unSupportPost/:id", postController.unSupportPost);

router.get("/user_posts/:id", postController.getUserPosts);

router.put("/savePost/:id", postController.savePost);

router.put("/unSavePost/:id", postController.unSavePost);

router.get("/getSavePosts", postController.getSavePost);

//share post
//router.patch("/sharePost/:id", postController.sharePost);

router.put("/reportPost/:id", postController.reportPost);

router.put("/unReportPost/:id", postController.unReportPost);


module.exports = router;

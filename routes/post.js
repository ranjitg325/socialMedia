const express = require('express');
const router = express.Router();

const postController = require("../controllers/postController");
const middleware = require("../middleware/authenticateUser");
//_id: req.user.userId
router.post("/posts",middleware.authenticateToken,  postController.createPost);

router.get("/getMyPosts", middleware.authenticateToken, postController.getPostsOfOwn);  //done by user only means my profile

router.put("/updatePost/:id", middleware.authenticateToken, postController.updatePost);

router.get("/newsFeed",middleware.authenticateToken,  postController.newsFeed)

router.delete("/deletePost/:id", middleware.authenticateToken, postController.deletePost);

router.patch("/likePost/:id", middleware.authenticateToken, postController.likePost);

router.patch("/unlikepost/:id", middleware.authenticateToken, postController.unLikePost);

router.patch("/supportPost/:id", middleware.authenticateToken, postController.supportPost);

router.patch("/unSupportPost/:id",middleware.authenticateToken, postController.unSupportPost);

router.get("/user_posts/:id", middleware.authenticateToken, postController.getUserPosts);

router.put("/savePost/:id", middleware.authenticateToken, postController.savePost);

router.put("/unSavePost/:id", middleware.authenticateToken, postController.unSavePost);

router.get("/getSavePosts", middleware.authenticateToken, postController.getSavePost);

//share post
router.put("/sharePost/:id",middleware.authenticateToken, postController.sharePost);

router.get("/getSharedPosts",middleware.authenticateToken, postController.getMySharedPost);

router.delete("/deleteSharedPost/:id",middleware.authenticateToken, postController.deleteSharedPost);

router.put("/reportPost/:id", middleware.authenticateToken, postController.reportPost);

router.put("/unReportPost/:id",middleware.authenticateToken,  postController.unReportPost);


module.exports = router;

const express = require('express');
const router = express.Router();

const postController = require("../controllers/postController");
//const auth = require("../middleware/authenticateUser");

router.post("/posts", postController.createPost);
router.get("/getMyPosts", postController.getPostsOfOwn);

router.put("/updatePost", postController.updatePost);
//router.put("/getPost", postController.getPost);
router.delete("/deletePost/:id", postController.deletePost);


router.patch("/likePost/:id", postController.likePost);

router.patch("/unlikepost/:id", postController.unLikePost);

router.get("/user_posts/:id", postController.getUserPosts);

//router.get("/post_discover", postController.getPostsDicover);

router.put("/savePost/:id", postController.savePost);

router.put("/unSavePost/:id", postController.unSavePost);

router.get("/getSavePosts", postController.getSavePost);

module.exports = router;

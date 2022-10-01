const express = require('express');
const router = express.Router();

const postController = require("../controllers/postController");
//const auth = require("../middleware/authenticateUser");

router
  .route("/posts")
  .post(/*auth,*/ postController.createPost)
  .get(/*auth,*/ postController.getPosts);

router
  .route("/post/:id")
  .patch(/*auth,*/ postController.updatePost)
  .get(/*auth,*/ postController.getPost)
  .delete(/*auth,*/ postController.deletePost);

router.patch("/post/:id/like", postController.likePost);

router.patch("/post/:id/unlike", postController.unLikePost);

router.get("/user_posts/:id",  postController.getUserPosts);

router.get("/post_discover",  postController.getPostsDicover);

router.patch("/savePost/:id",  postController.savePost);

router.patch("/unSavePost/:id",  postController.unSavePost);

router.get("/getSavePosts", postController.getSavePosts);

module.exports = router;

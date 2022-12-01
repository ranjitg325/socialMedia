const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');
const commentController = require('../controllers/commentController');
const middleware = require('../middleware/authenticateUser');

router.post('/createPage',middleware.authenticateToken, pageController.createPage);  
router.put('/addUserToPage/:id',middleware.authenticateToken, pageController.addUserToPage);

router.put('/removeUserFromPage/:id',middleware.authenticateToken, pageController.removeUserFromPage);

router.get('/getMyPages',middleware.authenticateToken, pageController.getMyPages);
//get all pages use by admin only
router.get('/getAllPages',middleware.authenticateToken, pageController.getAllPages);

router.put('/updatePage/:id',middleware.authenticateToken, pageController.updatePage);

router.delete('/deletePage/:id',middleware.authenticateToken, pageController.deletePage);
//search by page name
router.get('/searchPageByName',middleware.authenticateToken, pageController.searchPageByName); 
//search by page category
router.get('/searchPageByCategory',middleware.authenticateToken, pageController.searchPageByCategory);
//get all users of a page
router.get('/getAllUsersOfPage/:id',middleware.authenticateToken, pageController.getAllUsersInPage);
//get all posts of a page
router.get('/getAllPostsOfPage/:id',middleware.authenticateToken, pageController.getAllPostsOfPage);
//join page
router.put('/joinPage/:id',middleware.authenticateToken, pageController.joinPage);
//accept request to join page
router.put('/acceptRequestToJoinPage/:id',middleware.authenticateToken, pageController.acceptRequestToJoinPage);
//leave page
router.put('/leavePage/:id',middleware.authenticateToken, pageController.leavePage);
//delete post from page
router.delete('/deletePostFromPage/:id',middleware.authenticateToken, pageController.deletePostFromPage);
//update post from page
router.put('/updatePostFromPage/:id',middleware.authenticateToken, pageController.updatePostOfPage); 
//like post of page
router.patch('/likePostOfPage/:id',middleware.authenticateToken, pageController.likePostOfPage);
//unlike post of page
router.patch('/unLikePostOfPage/:id',middleware.authenticateToken, pageController.unLikePostOfPage);
//comment on post of page
router.post('/commentOnPostOfPage',middleware.authenticateToken, commentController.createComment);
//like comment on post of page
router.patch('/likeCommentOnPostOfPage/:id',middleware.authenticateToken, commentController.likeComment);
//unlike comment on post of page
router.patch('/unLikeCommentOnPostOfPage/:id',middleware.authenticateToken, commentController.unLikeComment);
//delete comment on post of page
router.delete('/deleteCommentOnPostOfPage/:id',middleware.authenticateToken, commentController.deleteComment);
//like page
router.patch('/likePage/:id',middleware.authenticateToken, pageController.likePage);
//unlike page
router.patch('/unLikePage/:id',middleware.authenticateToken, pageController.unLikePage);
//report page
router.patch('/reportPage/:id',middleware.authenticateToken, pageController.reportPage);
//unreport page
router.patch('/unReportPage/:id',middleware.authenticateToken, pageController.unReportPage);


router.post('/postInsidePage/:id',middleware.authenticateToken, pageController.postInsidePage);

module.exports = router;
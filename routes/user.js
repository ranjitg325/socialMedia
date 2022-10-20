const express = require('express');
const router = express.Router();
//const middleware = require("../middleware/authenticateUser");
const userController = require('../controllers/userController');


router.post('/userCreate', userController.user_signup);
router.post('/email_otp',userController.send_otp_toEmail);
router.post('/login',userController.login);
router.get('/logout',userController.logout);

router.post('/forgotPassword',userController.forgotPassword); 
router.post('/updatePassword',userController.updatePassword); 

router.put('/userUpdate',userController.userUpdate);
router.delete('/deleteUser',userController.deleteUser);


router.get('/searchByUsername',userController.searchByUsername);
router.get('/getByUsername',userController.getByUsername);

router.patch('/:id/follow',userController.follow);
router.patch('/:id/unfollow',userController.unfollow);
router.get('/suggestionsUser',userController.suggestionsUser);
router.get('/getFollowers',userController.getFollowers);
router.get('/getFollowing',userController.getFollowing);
router.get('/getFollowersCount',userController.getFollowersCount);
router.get('/getFollowingCount',userController.getFollowingCount);
//router.post('/sharePost/:id',userController.sharePost);   //not working
//router.get('/getProfile',userController.getProfile);
//block user
router.patch('/blockUser/:id',userController.blockUser);
router.patch('/unBlockUser/:id',userController.unblockUser);
router.get('/getBlockedUsers',userController.getBlockedUsers);
router.get('/getBlockedUsersCount',userController.getBlockedUsersCount);
//router.get('/newsFeed',userController.getTimeline);


module.exports = router;

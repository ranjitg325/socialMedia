const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const middleware = require("../middleware/authenticateUser");  //_id: req.user.userId


router.post('/userCreate', userController.user_signup);
router.post('/email_otp', userController.send_otp_toEmail);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

router.post('/forgotPassword', userController.forgotPassword);
router.post('/updatePassword', userController.updatePassword);  //after otp verification(forgot password) user can change their password

router.put('/userUpdate', middleware.authenticateToken, userController.userUpdate);
router.delete('/deleteUser', middleware.authenticateToken, userController.deleteUser);

router.get('/searchByUsername', middleware.authenticateToken, userController.searchByUsername);
router.get('/getByUsername',middleware.authenticateToken, userController.getByUsername);

router.patch('/:id/follow', middleware.authenticateToken, userController.follow);
router.patch('/:id/unfollow', middleware.authenticateToken,userController.unfollow);
router.get('/suggestionsUser', middleware.authenticateToken,userController.suggestionsUser);
router.get('/getFollowers', middleware.authenticateToken, userController.getFollowers);
router.get('/getFollowing', middleware.authenticateToken, userController.getFollowing);
router.get('/getFollowersCount',middleware.authenticateToken, userController.getFollowersCount);
router.get('/getFollowingCount', middleware.authenticateToken, userController.getFollowingCount);
//router.post('/sharePost/:id',userController.sharePost);   //not working
//router.get('/getProfile',userController.getProfile);
//block user
router.patch('/blockUser/:id', middleware.authenticateToken,userController.blockUser);
router.patch('/unBlockUser/:id', middleware.authenticateToken, userController.unblockUser);
router.get('/getBlockedUsers', middleware.authenticateToken, userController.getBlockedUsers);
router.get('/getBlockedUsersCount',middleware.authenticateToken, userController.getBlockedUsersCount);
//router.get('/newsFeed',userController.getTimeline);

module.exports = router;

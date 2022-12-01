const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const middleware = require("../middleware/authenticateUser"); 

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

//router.get('/getProfile',userController.getProfile);
//block user
router.patch('/blockUser/:id', middleware.authenticateToken,userController.blockUser);
router.patch('/unBlockUser/:id', middleware.authenticateToken, userController.unblockUser);
router.get('/getBlockedUsers', middleware.authenticateToken, userController.getBlockedUsers);
router.get('/getBlockedUsersCount',middleware.authenticateToken, userController.getBlockedUsersCount);

//send friend request
router.patch('/sendFriendRequest/:id', middleware.authenticateToken, userController.sendFriendRequest);
router.patch('/cancelFriendRequest/:id', middleware.authenticateToken, userController.cancelFriendRequest);
router.patch('/acceptFriendRequest/:id', middleware.authenticateToken, userController.acceptFriendRequest);
//router.patch('/rejectFriendRequest/:id', middleware.authenticateToken, userController.rejectFriendRequest);
router.get('/getFriendRequests', middleware.authenticateToken, userController.getFriendRequests);
router.get('/getSentFriendRequests', middleware.authenticateToken, userController.getSentFriendRequests);
router.get('/getFriends', middleware.authenticateToken, userController.getFriends);
router.get('/getFriendsCount', middleware.authenticateToken, userController.getFriendsCount);
router.get('/getFriendRequestsCount', middleware.authenticateToken, userController.getFriendRequestsCount);
router.get('/getSentFriendRequestsCount', middleware.authenticateToken, userController.getSentFriendRequestsCount);
router.get('/getMutualFriends/:id', middleware.authenticateToken, userController.getMutualFriends);
router.patch('/unfriend/:id', middleware.authenticateToken, userController.unfriend);
router.get('/getMutualFriendsCount/:id', middleware.authenticateToken, userController.getMutualFriendsCount); 
//pull sent friend request
router.patch('/pullFriendRequest/:id', middleware.authenticateToken, userController.pullFriendRequest); 

module.exports = router;

const express = require('express');
const router = express.Router();
//const middleware = require("../middleware/authenticateUser");
const userController = require('../controllers/userController');


router.post('/userCreate', userController.user_signup);
router.post('/email_otp',userController.send_otp_toEmail);
router.post('/login',userController.login);
router.get('/logout',userController.logout);
// router.post('/forgotPassword',userController.forgotPassword);
//router.post('/changePassword',userController.changePassword);
router.put('/userUpdate',userController.userUpdate);
router.delete('/deleteUser',userController.deleteUser);


router.get('/searchByUsername',userController.searchByUsername);
router.get('/getByUsername',userController.getByUsername);
router.patch('/:id/follow',userController.follow);
router.patch('/:id/unfollow',userController.unfollow);
router.get('/suggestionsUser',userController.suggestionsUser);

module.exports = router;

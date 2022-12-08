const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require("../controllers/adminController");
const middleware = require("../middleware/authenticateUser");


router.post('/signup', adminController.admin_signup);
router.post('/email_otp',adminController.send_otp_toEmail);
router.post('/login',adminController.login);
router.post('/logout',middleware.authenticateToken, adminController.logout);
router.post('/forgotPassword', adminController.forgotPassword); 
router.post('/updatePassword', adminController.updatePassword); //after otp verification(forgot password) user can change their password

router.put('/update',middleware.authenticateToken ,adminController.admin_update);

router.get('/getAdminById',middleware.authenticateToken , adminController.getAdminById);
router.get('/getAllAdmins',middleware.authenticateToken ,  adminController.getAllAdmins);
router.delete('/deleteAdmin',middleware.authenticateToken ,  adminController.deleteAdmin);

router.get('/getAllUser',middleware.authenticateToken ,  userController.getAllUser);  //done by admin only
router.get('/getUserById', middleware.authenticateToken , userController.getUserById); //done by admin only
router.get('/getReportedUser',middleware.authenticateToken ,  adminController.getReportedPosts); //done by admin only

module.exports = router
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require("../controllers/adminController");
//const middleware = require("../middleware/authenticateUser");


router.post('/signup', adminController.admin_signup);
router.post('/login', adminController.admin_login);
router.put('/update', adminController.admin_update);
router.get('/getAdminById', adminController.getAdminById);
router.get('/getAllAdmins',  adminController.getAllAdmins);
router.delete('/deleteAdmin',  adminController.deleteAdmin);



router.get('/getAllUser',  userController.getAllUser);  //done by admin only
router.get('/getUserById',  userController.getUserById); //done by admin only
router.get('/getReportedUser',  adminController.getReportedPosts); //done by admin only

module.exports = router
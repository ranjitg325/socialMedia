const express = require('express');
const router = express.Router();

const sharePageController = require("../controllers/sharePageController");
const middleware = require("../middleware/authenticateUser");

router.post("/sharePage",middleware.authenticateToken, sharePageController.sharePage);

module.exports = router;
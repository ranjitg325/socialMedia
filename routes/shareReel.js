const express = require('express');
const router = express.Router();

const shareReelController = require("../controllers/shareReelController");
//const middleware = require("../middleware/authenticateUser");

router.put("/shareReel",  shareReelController.shareReel);

module.exports = router;
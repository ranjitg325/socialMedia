const express = require('express');
const router = express.Router();

const reelStoryController = require('../controllers/reelsStoryController');
const middleware = require('../middleware/authenticateUser');

router.post('/uploadReelStory',middleware.authenticateToken, reelStoryController.createStory);
router.get('/getStories',middleware.authenticateToken, reelStoryController.getStories);
router.get('/getMyStories',middleware.authenticateToken, reelStoryController.getMyStories); 
router.delete('/deleteStory/:id',middleware.authenticateToken, reelStoryController.deleteStory); 

module.exports = router;
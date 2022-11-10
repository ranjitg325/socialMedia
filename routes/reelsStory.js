const express = require('express');
const router = express.Router();

const reelStoryController = require('../controllers/reelsStoryController');

router.post('/uploadReelStory', reelStoryController.createStory);
router.get('/getStories', reelStoryController.getStories);
router.get('/getMyStories', reelStoryController.getMyStories);
router.delete('/deleteStory/:id', reelStoryController.deleteStory);
module.exports = router;
const express = require('express');
const router = express.Router();

const reelController = require('../controllers/reelsController');

router.post('/uploadReel', reelController.createReel);
router.get('/getAllReels', reelController.getAllReels);
router.get('/getMyReels', reelController.getMyReels);
router.get('/searchReels', reelController.searchReels);
router.put('/updateReel/:id', reelController.updateReel);
router.delete('/deleteReel/:id', reelController.deleteReel);
router.put('/likeReel/:id', reelController.likeReel);
router.put('/unlikeReel/:id', reelController.unlikeReel);
router.put('/saveReel/:id', reelController.saveReel);
router.put('/unsaveReel/:id', reelController.unsaveReel);
router.get('/getSavedReels', reelController.getSavedReels);
router.get('/getUserReels/:id', reelController.getUserReels);
router.put('/shareReel/:id', reelController.shareReel);
router.put('/reportReel/:id', reelController.reportReel);
router.get('/getReportedReels', reelController.getReportedReels);

module.exports = router;
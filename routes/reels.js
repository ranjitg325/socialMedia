const express = require('express');
const router = express.Router();

const reelController = require('../controllers/reelsController');
const middleware = require('../middleware/authenticateUser');

router.post('/uploadReel',middleware.authenticateToken, reelController.createReel);
router.get('/getAllReels',middleware.authenticateToken, reelController.getAllReels);
router.get('/getMyReels',middleware.authenticateToken,reelController.getMyReels);
router.get('/searchReels',middleware.authenticateToken, reelController.searchReels);
router.put('/updateReel/:id',middleware.authenticateToken, reelController.updateReel);
router.delete('/deleteReel/:id',middleware.authenticateToken, reelController.deleteReel);
router.put('/likeReel/:id', middleware.authenticateToken,reelController.likeReel);
router.put('/unlikeReel/:id',middleware.authenticateToken, reelController.unlikeReel);
router.put('/saveReel/:id',middleware.authenticateToken, reelController.saveReel);
router.put('/unsaveReel/:id', middleware.authenticateToken,reelController.unsaveReel);
router.get('/getSavedReels',middleware.authenticateToken, reelController.getSavedReels);
router.get('/getUserReels/:id',middleware.authenticateToken, reelController.getUserReels);
router.put('/shareReel/:id',middleware.authenticateToken, reelController.shareReel); 
router.put('/reportReel/:id', middleware.authenticateToken,reelController.reportReel);
router.get('/getReportedReels', middleware.authenticateToken,reelController.getReportedReels);

module.exports = router;
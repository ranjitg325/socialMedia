const express = require('express');
const router = express.Router();

const organiseEventController = require('../controllers/organiseEventController');
const adminController = require('../controllers/adminController');
const commentOrganiseEventController = require('../controllers/commentOrganiseEventController');
const middleware = require("../middleware/authenticateUser");

router.post('/createEvent', middleware.authenticateToken, organiseEventController.createEvent);
router.get('/getMyEvent', middleware.authenticateToken, organiseEventController.getMyEvents);
router.get('/getMyEventsCount', middleware.authenticateToken, organiseEventController.getMyEventsCount);
router.get('/getAllEvents', middleware.authenticateToken, organiseEventController.getAllEvents);
router.get('/getAllEventsCount', middleware.authenticateToken, organiseEventController.getAllEventsCount);
//get event by category
router.get('/getEventByCategory', middleware.authenticateToken, organiseEventController.getEventByCategory);
//get event by date
router.get('/getEventByDate', middleware.authenticateToken, organiseEventController.getEventByDate);
//get event by location
//router.get('/getEventByLocation', middleware.authenticateToken, organiseEventController.getEventByLocation);
//get event by name
router.get('/getEventByName', middleware.authenticateToken, organiseEventController.getEventByName);
//get event by date and category
router.get('/getEventByDateAndCategory', middleware.authenticateToken, organiseEventController.getEventByDateAndCategory);
router.put('/updateEvent/:id', middleware.authenticateToken, organiseEventController.updateEvent);
router.delete('/deleteEvent/:id', middleware.authenticateToken, organiseEventController.deleteEvent);

//join event
router.put('/joinEvent/:id', middleware.authenticateToken, organiseEventController.joinEvent);
//leave event
router.put('/leaveEvent/:id', middleware.authenticateToken, organiseEventController.leaveEvent);
//get joined events
router.get('/getJoinedEvents', middleware.authenticateToken, organiseEventController.getJoinedEvents);
//get joined events count
router.get('/getJoinedEventsCount', middleware.authenticateToken, organiseEventController.getJoinedEventsCount);
//add participant
router.put('/addParticipant/:id', middleware.authenticateToken, organiseEventController.addParticipants);
//remove participant
router.put('/removeParticipant/:id', middleware.authenticateToken, organiseEventController.removeParticipants);
//like event
router.put('/likeEvent/:id', middleware.authenticateToken, organiseEventController.likeEvent);
//unlike event
router.put('/unlikeEvent/:id', middleware.authenticateToken, organiseEventController.unlikeEvent);
//report event
router.put('/reportEvent/:id', middleware.authenticateToken, organiseEventController.reportEvent);
//unreport event
router.put('/unreportEvent/:id', middleware.authenticateToken, organiseEventController.unreportEvent);

//comment on event
router.post('/commentOnEvent', middleware.authenticateToken, commentOrganiseEventController.createComment);
//update comment on event
router.put('/updateCommentOnEvent/:id', middleware.authenticateToken, commentOrganiseEventController.updateComment);
//like comment on event
router.put('/likeCommentOnEvent/:id', middleware.authenticateToken, commentOrganiseEventController.likeComment);
// //unlike comment on event
router.put('/unlikeCommentOnEvent/:id', middleware.authenticateToken, commentOrganiseEventController.unlikeComment);
// //delete comment on event
router.delete('/deleteCommentOnEvent/:id', middleware.authenticateToken, commentOrganiseEventController.deleteComment);

//get reported events by admin
router.get('/getReportedEvents', middleware.authenticateToken, adminController.getReportedEvents);
//get reported events count by admin
router.get('/getReportedEventsCount', middleware.authenticateToken, adminController.getReportedEventsCount);


module.exports = router;

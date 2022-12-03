const express = require('express');
const router = express.Router();

const organiseEventController = require('../controllers/organiseEventController');
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
module.exports = router;

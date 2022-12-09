const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');
const middleware = require('../middleware/authenticateUser');

router.post('/createQuestion',middleware.authenticateToken, questionController.createQuestion);
//update question
router.put('/updateQuestion/:id',middleware.authenticateToken, questionController.updateQuestion);
//delete question
router.delete('/deleteQuestion/:id',middleware.authenticateToken, questionController.deleteQuestion);
//get all questions
router.get('/getAllQuestions',middleware.authenticateToken, questionController.getAllQuestions);

router.get('/getAllQuestionsWithAnswer',middleware.authenticateToken, questionController.getAllQuestionsWithAnswer);

//ask question for varification
router.post('/verifyUser',middleware.authenticateToken, questionController.verifyUser);

module.exports = router;

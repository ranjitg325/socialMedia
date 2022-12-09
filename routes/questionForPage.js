const express = require('express');
const router = express.Router();

const questionControllerForPage = require('../controllers/questionControllerForPage');
const middleware = require('../middleware/authenticateUser');

router.post('/createQuestion',middleware.authenticateToken, questionControllerForPage.createQuestionForPage);
//update question
router.put('/updateQuestion/:id',middleware.authenticateToken, questionControllerForPage.updateQuestionForPage);
//delete question
router.delete('/deleteQuestion/:id',middleware.authenticateToken, questionControllerForPage.deleteQuestionForPage);
//get all questions
router.get('/getAllQuestions',middleware.authenticateToken, questionControllerForPage.getAllQuestionsForPage);

router.get('/getAllQuestionsWithAnswer',middleware.authenticateToken, questionControllerForPage.getAllQuestionsForPageWithAnswer);

//verify page
router.post('/verifyPage/:id',middleware.authenticateToken, questionControllerForPage.verifyPage);

module.exports = router;

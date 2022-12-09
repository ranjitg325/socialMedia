const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const pageModel = require('../models/pageModel');
const questionModelForPage = require('../models/questionModelForPage');

//create question for page by admin
exports.createQuestionForPage = async (req, res) => {
    try {
        const { question, option1, option2, option3, option4, answer } = req.body;
        const admin = req.user.userId;

        const checkAdmin = await adminModel.findOne({ _id: admin });
        if (!checkAdmin)
            return res.status(400).json({ msg: 'This admin does not exist.' });

        const newQuestion = new questionModelForPage({
            question,
            option1,
            option2,
            option3,
            option4,
            answer,
            admin,
        });

        await newQuestion.save();

        res.status(201).send({ msg: 'question created for page', data: newQuestion });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};

//only admin can update a question
exports.updateQuestionForPage = async (req, res) => {
    try {
        const { question, option1, option2, option3, option4, answer } = req.body;
        const questionId = req.params.id;
        const admin = req.user.userId;

        const checkAdmin = await adminModel.findOne({ _id: admin });
        if (!checkAdmin)
            return res.status(400).json({ msg: 'This admin does not exist.' });
        const question2 = await questionModelForPage.findOne({ _id: questionId });
        if (!question2)
            return res.status(400).json({ msg: 'This question does not exist.' });

        const updatedQuestion = await questionModelForPage.findByIdAndUpdate(
            {
                _id: questionId,
                admin: admin,
            },
            {
                question,
                option1,
                option2,
                option3,
                option4,
                answer,
            },
            { new: true }
        );

        res.status(200).send({ msg: 'question updated', data: updatedQuestion });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};

//only admin can delete a question
exports.deleteQuestionForPage = async (req, res) => {
    try {
        const questionId = req.params.id;
        const admin = req.user.userId;

        const checkAdmin = await adminModel.findOne({ _id: admin });
        if (!checkAdmin)
            return res.status(400).json({ msg: 'This admin does not exist.' });
        const question2 = await questionModelForPage.findOne({ _id: questionId });
        if (!question2)
            return res.status(400).json({ msg: 'This question does not exist.' });

        await questionModelForPage.findByIdAndDelete({
            _id: questionId,
            admin: admin,
        });

        res.status(200).send({ msg: 'question deleted' });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};

//get all questions for page
exports.getAllQuestionsForPage = async (req, res) => {
    try {
        const questions = await questionModelForPage.find().select( '-answer')
        res.status(200).send({ msg: 'all questions for page', data: questions });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

exports.getAllQuestionsForPageWithAnswer = async (req, res) => {
    try {
        const questions = await questionModelForPage.find();
        res.status(200).send({ msg: 'all questions for page', data: questions });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get all questions for page by page id
// exports.getAllQuestionsForPageByPageId = async (req, res) => {
//     try {
//         const pageId = req.params.id;
//         const checkPage = await pageModel.findOne({ _id: pageId });
//         if (!checkPage)
//             return res.status(400).json({ msg: 'This page does not exist.' });

//         const questions = await questionModelForPage.find({ page: pageId });
//         res.status(200).send({ msg: 'all questions for page', data: questions });
//     } catch (err) {
//         return res.status(500).send({ msg: err.message });
//     }
// }

//verify if page admin answer all question then page is verified, using loop
exports.verifyPage = async (req, res) => {
    try {
        const { answer } = req.body;
        const pageId = req.params.id;
        const userId = req.user.userId;

        const checkPage = await pageModel.findOne({ _id: pageId });
        if (!checkPage)
            return res.status(400).json({ msg: 'This page does not exist.' });
        const checkUser = await userModel.findOne({ _id: userId });
        if (!checkUser)
            return res.status(400).json({ msg: 'This user does not exist.' });
//only page admin can verify page
        if (checkPage.admin != userId)
            return res.status(400).json({ msg: 'You are not page admin.' });

        const questions = await questionModelForPage.find();

        let count = 0;
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].answer === answer[i]) {
                count++;
            }
        }

        if (count === questions.length) {
            await pageModel.findByIdAndUpdate(
                { _id: pageId },
                { isVerified: true },
                { new: true }
            );
            res.status(200).send({ msg: 'page is verified' });
        } else {
            res.status(200).send({ msg: 'page is not verified' });
        }
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};
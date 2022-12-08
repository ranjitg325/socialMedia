const userModel = require('../models/userModel');
const adminModel = require('../models/adminModel');
const questionModel = require('../models/questionModel');

exports.createQuestion = async (req, res) => {
    try {
        const { question, option1, option2, option3, option4, answer } = req.body;
        const admin = req.user.userId;

        const checkAdmin = await adminModel.findOne({ _id: admin });
        if (!checkAdmin)
            return res.status(400).json({ msg: 'This admin does not exist.' });

        const newQuestion = new questionModel({
            question,
            option1,
            option2,
            option3,
            option4,
            answer,
            admin,
        });

        await newQuestion.save();

        res.status(201).send({ msg: 'question created', data: newQuestion });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};

//only admin can update a question
exports.updateQuestion = async (req, res) => {
    try {
        const { question, option1, option2, option3, option4, answer } = req.body;
        const questionId = req.params.id;
        const admin = req.user.userId;

        const checkAdmin = await adminModel.findOne({ _id: admin });
        if (!checkAdmin)
            return res.status(400).json({ msg: 'This admin does not exist.' });
        const question2 = await questionModel.findOne({ _id: questionId });
        if (!question2)
            return res.status(400).json({ msg: 'This question does not exist.' });

        const updatedQuestion = await questionModel.findByIdAndUpdate(
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

//delete a question
exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const admin = req.user.userId;

        const checkAdmin = await adminModel.findOne({ _id: admin });
        if (!checkAdmin)
            return res.status(400).json({ msg: 'This admin does not exist.' });
        const question = await questionModel.findOne({ _id: questionId });
        if (!question)
            return res.status(400).json({ msg: 'This question does not exist.' });

        const deletedQuestion = await questionModel.findByIdAndDelete({
            _id: questionId,
            admin: admin,
        });

        res.status(200).send({ msg: 'question deleted', data: deletedQuestion });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};

//get all questions
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await questionModel.find();

        res.status(200).send({ msg: 'all questions', data: questions });
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}

//get a question
// exports.getQuestion = async (req, res) => {
//     try {
//         const questionId = req.params.id;
//         const question = await questionModel.findOne({ _id: questionId });

//         res.status(200).send({ msg: 'question', data: question });
//     } catch (err) {
//         return res.status(500).send({ msg: err.message });
//     }
// }

//vif user answer all question then user is verified
exports.verifyUser = async (req, res) => {
    try {
        const { answer } = req.body;
        const userId = req.user.userId;

        const checkUser = await userModel.findOne({ _id: userId });
        if (!checkUser)
            return res.status(400).json({ msg: 'This user does not exist.' });

        const questions = await questionModel.find();

        let count = 0;
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].answer == answer[i]) {
                count++;
            }
        }

        if (count == questions.length) {
            const verifiedUser = await userModel.findByIdAndUpdate(
                { _id: userId },
                { isVerified: true },
                { new: true }
            );

            res.status(200).send({ msg: 'user verified', data: verifiedUser });
        } else {
            res.status(400).send({ msg: 'user not verified' });
        }
    } catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};
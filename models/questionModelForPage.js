const mongoose = require("mongoose");

const questionSchemaForPage = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },
        option1: {
            type: String,
            //required: true,
            trim: true,
        },
        option2: {
            type: String,
            //required: true,
            trim: true,
        },
        option3: {
            type: String,
            //required: true,
            trim: true,
        },
        option4: {
            type: String,
            //required: true,
            trim: true,
        },
        answer: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("questionForPage", questionSchemaForPage);
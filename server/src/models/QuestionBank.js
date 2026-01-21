// src/models/QuestionBank.js
const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['javascript', 'python', 'react', 'nodejs', 'database', 'system_design', 'behavioral'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    tags: [String],
    sampleAnswer: String,
    pointsToEvaluate: [String]
});

module.exports = mongoose.model('QuestionBank', questionBankSchema);
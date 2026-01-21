// src/models/InterviewSession.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: ''
    },
    score: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ''
    },
    timeTaken: { // seconds
        type: Number,
        default: 0
    },
    questionType: {
        type: String,
        enum: ['technical', 'behavioral', 'resume_based'],
        default: 'technical'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    askedAt: {
        type: Date,
        default: Date.now
    },
    answeredAt: {
        type: Date
    }
});

const interviewSessionSchema = new mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Practice Interview'
    },
    jobRole: {
        type: String,
        default: 'Software Developer'
    },
    resumeText: {
        type: String,
        default: ''
    },
    questions: [questionSchema],
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    totalScore: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    strengths: [String],
    weaknesses: [String],
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    duration: { // in minutes
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
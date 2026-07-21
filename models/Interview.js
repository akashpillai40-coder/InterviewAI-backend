const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  improvements: { type: String, default: '' }
});


const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // This field id referred to user_.id from User model
    ref: 'User',      //Objectid store here referred to User model
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [String],
  answers: [answerSchema],
  overallScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed'], 
    default: 'pending'
  }
  
}, { timestamps: true });

//Compound index
  interviewSchema.index({
    userId:1,
    createdAt: -1
  })

module.exports = mongoose.model('Interview', interviewSchema);
//mongoose is used to define the schema for the Interview model, which includes fields for userId, role, difficulty, questions, answers, overallScore, and status.
//The answerSchema is a sub-document schema that defines the structure of each answer in the answers array. The Interview model is then exported for use in other parts of the application.
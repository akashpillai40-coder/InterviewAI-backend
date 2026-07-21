const Interview = require('../models/Interview');
const User = require('../models/User');
const { generateQuestions, evaluateAnswer } = require('../services/geminiService');

 //interview === interview doc in Interview Collection

// @desc    Create new interview + generate questions
// @route   POST /api/interview/create
const createInterview = async (req, res) => {
  try {
    const { role, difficulty, count } = req.body;

    // check free plan limit
    const user = await User.findById(req.user._id);
    if (user.plan === 'free' && user.interviewsThisMonth >= 30) {
      return res.status(403).json({ 
        message: 'Free plan limit reached. Upgrade to Pro for unlimited interviews.' 
      });
    }

    // generate questions from Gemini
    const questions = await generateQuestions(role, difficulty, count || 5);

    // save interview to DB
    const interview = await Interview.create({
      userId: req.user._id,
      role,
      difficulty,
      questions,
      status: 'pending'
    });

    // increment monthly count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { interviewsThisMonth: 1 }
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answer + get AI evaluation
// @route   POST /api/interview/:id/submit
const submitAnswer = async (req, res) => {
  try {
    const {  questionIndex, answer } = req.body;

    const interviewId = req.params.id
   
    //find the interview doc, find qn inside, evaluate, push ans to doc
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // get question
    const question = interview.questions[questionIndex];

    // evaluate answer with Gemini
    const evaluation = await evaluateAnswer(
      question,
      answer,
      interview.role,
      interview.difficulty
    );

    // save answer to interview doc
    interview.answers[questionIndex]= {
      question,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      improvements: evaluation.improvements
    };

    await interview.save();

    // emit real-time update via socket.io
    const io = req.app.get('io');
    io.to(interviewId).emit('answer:evaluated', {
      questionIndex,
      score: evaluation.score,
      feedback: evaluation.feedback,
      improvements: evaluation.improvements
    });

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete interview + calculate overall score
// @route   POST /api/interview/complete
const completeInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // calculate overall score
    const totalScore = interview.answers.reduce((sum, a) => sum + a.score, 0);
    const overallScore = Math.round(totalScore / interview.answers.length);

    interview.overallScore = overallScore;
    interview.status = 'completed';
    await interview.save();

    // emit completion via socket.io
    const io = req.app.get('io');
    io.to(interviewId).emit('interview:complete', { overallScore });

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all interviews for user
// @route   GET /api/interview/history

//req.user contains the user details from MOngoDB done  by protect middleware
const getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('role difficulty overallScore status createdAt');

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single interview
// @route   GET /api/interview/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
   
    // make sure user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInterview,
  submitAnswer,
  completeInterview,
  getHistory,
  getInterview
};


Interview.find({ 
  role:'Frontend',
  difficulty:'hard',
  status:'completed'
})
.sort({
  overallScore: -1
})

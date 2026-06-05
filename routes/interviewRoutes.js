const express = require('express');
const router = express.Router();
const {
  createInterview,
  submitAnswer,
  completeInterview,
  getHistory,
  getInterview
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createInterview);
router.post('/submit', protect, submitAnswer);
router.post('/complete', protect, completeInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterview);

module.exports = router;
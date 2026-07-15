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
router.post('/:id/submit', protect, submitAnswer);
router.post('/:id/complete', protect, completeInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterview);

module.exports = router;
 
// protect middleware is used to ensure that only authenticated users can access these routes.
// create route is used to create a new interview.
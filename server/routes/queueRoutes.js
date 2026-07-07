const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createQueue,
  getQueues,
  getQueueById,
  deleteQueue,
} = require('../controllers/queueController');
const { getQueueAnalytics } = require('../controllers/analyticsController');

// All queue routes require a logged-in manager
router.use(protect);

router.route('/').post(createQueue).get(getQueues);
router.route('/:id').get(getQueueById).delete(deleteQueue);
router.get('/:id/analytics', getQueueAnalytics);

module.exports = router;

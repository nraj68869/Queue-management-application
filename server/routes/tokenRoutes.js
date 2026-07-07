const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addToken,
  getTokens,
  moveToken,
  assignNextToken,
  completeToken,
  cancelToken,
} = require('../controllers/tokenController');

router.use(protect);

// Queue-scoped actions
router.route('/:queueId').post(addToken).get(getTokens);
router.put('/:queueId/assign-next', assignNextToken);

// Individual token actions
router.put('/:id/move', moveToken);
router.put('/:id/complete', completeToken);
router.delete('/:id', cancelToken);

module.exports = router;

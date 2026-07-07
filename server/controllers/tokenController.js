const Token = require('../models/Token');
const Queue = require('../models/Queue');
const asyncHandler = require('../middleware/asyncHandler');

// Helper: confirm the queue exists and belongs to the requesting manager.
// Throws a 404 (not 403) so we don't leak whether the queue id exists at all.
const getOwnedQueueOrFail = async (queueId, managerId) => {
  const queue = await Queue.findOne({ _id: queueId, manager: managerId });
  if (!queue) {
    const error = new Error('Queue not found');
    error.statusCode = 404;
    throw error;
  }
  return queue;
};

// @desc    Add a new person/token to a queue
// @route   POST /api/tokens/:queueId
// @access  Private
const addToken = asyncHandler(async (req, res) => {
  const { queueId } = req.params;
  const { personName } = req.body;

  await getOwnedQueueOrFail(queueId, req.userId);

  if (!personName || !personName.trim()) {
    res.status(400);
    throw new Error('Person name is required');
  }

  // New token goes to the back of the (waiting) line
  const lastToken = await Token.findOne({ queue: queueId, status: 'waiting' }).sort({ position: -1 });
  const position = lastToken ? lastToken.position + 1 : 1;

  const token = await Token.create({ queue: queueId, personName: personName.trim(), position });

  res.status(201).json({ success: true, data: token });
});

// @desc    Get all tokens for a queue (waiting tokens ordered by position)
// @route   GET /api/tokens/:queueId
// @access  Private
const getTokens = asyncHandler(async (req, res) => {
  const { queueId } = req.params;
  await getOwnedQueueOrFail(queueId, req.userId);

  const tokens = await Token.find({ queue: queueId, status: { $ne: 'cancelled' } }).sort({
    status: 1, // 'serving' groups separately from 'waiting' naturally by insertion, sort by position mainly
    position: 1,
  });

  res.status(200).json({ success: true, data: tokens });
});

// @desc    Move a waiting token up or down in the queue
// @route   PUT /api/tokens/:id/move
// @body    { direction: 'up' | 'down' }
// @access  Private
const moveToken = asyncHandler(async (req, res) => {
  const { direction } = req.body;
  if (!['up', 'down'].includes(direction)) {
    res.status(400);
    throw new Error("Direction must be 'up' or 'down'");
  }

  const token = await Token.findById(req.params.id).populate('queue');
  if (!token || token.queue.manager.toString() !== req.userId) {
    res.status(404);
    throw new Error('Token not found');
  }

  if (token.status !== 'waiting') {
    res.status(400);
    throw new Error('Only waiting tokens can be reordered');
  }

  // Find the adjacent waiting token to swap positions with
  const neighbor = await Token.findOne({
    queue: token.queue._id,
    status: 'waiting',
    position: direction === 'up' ? { $lt: token.position } : { $gt: token.position },
  }).sort({ position: direction === 'up' ? -1 : 1 });

  if (!neighbor) {
    res.status(400);
    throw new Error(`Token is already at the ${direction === 'up' ? 'front' : 'back'} of the queue`);
  }

  // Swap positions
  const tempPosition = token.position;
  token.position = neighbor.position;
  neighbor.position = tempPosition;

  await token.save();
  await neighbor.save();

  res.status(200).json({ success: true, data: token });
});

// @desc    Assign the token at the top of the queue for service
// @route   PUT /api/tokens/:queueId/assign-next
// @access  Private
const assignNextToken = asyncHandler(async (req, res) => {
  const { queueId } = req.params;
  await getOwnedQueueOrFail(queueId, req.userId);

  const nextToken = await Token.findOne({ queue: queueId, status: 'waiting' }).sort({ position: 1 });

  if (!nextToken) {
    res.status(400);
    throw new Error('No waiting tokens in this queue');
  }

  nextToken.status = 'serving';
  nextToken.calledAt = new Date();
  await nextToken.save();

  res.status(200).json({ success: true, data: nextToken });
});

// @desc    Mark a token being served as complete
// @route   PUT /api/tokens/:id/complete
// @access  Private
const completeToken = asyncHandler(async (req, res) => {
  const token = await Token.findById(req.params.id).populate('queue');
  if (!token || token.queue.manager.toString() !== req.userId) {
    res.status(404);
    throw new Error('Token not found');
  }

  if (token.status !== 'serving') {
    res.status(400);
    throw new Error('Only a token currently being served can be completed');
  }

  token.status = 'served';
  token.servedAt = new Date();
  await token.save();

  res.status(200).json({ success: true, data: token });
});

// @desc    Cancel a token from the queue
// @route   DELETE /api/tokens/:id
// @access  Private
const cancelToken = asyncHandler(async (req, res) => {
  const token = await Token.findById(req.params.id).populate('queue');
  if (!token || token.queue.manager.toString() !== req.userId) {
    res.status(404);
    throw new Error('Token not found');
  }

  if (['served', 'cancelled'].includes(token.status)) {
    res.status(400);
    throw new Error('Token is already closed out');
  }

  token.status = 'cancelled';
  token.cancelledAt = new Date();
  await token.save();

  res.status(200).json({ success: true, data: token });
});

module.exports = {
  addToken,
  getTokens,
  moveToken,
  assignNextToken,
  completeToken,
  cancelToken,
};

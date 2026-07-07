const Queue = require('../models/Queue');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new queue
// @route   POST /api/queues
// @access  Private
const createQueue = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Queue name is required');
  }

  const queue = await Queue.create({ name: name.trim(), manager: req.userId });

  res.status(201).json({ success: true, data: queue });
});

// @desc    Get all queues belonging to the logged-in manager
// @route   GET /api/queues
// @access  Private
const getQueues = asyncHandler(async (req, res) => {
  const queues = await Queue.find({ manager: req.userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: queues });
});

// @desc    Get a single queue by id (must belong to the requesting manager)
// @route   GET /api/queues/:id
// @access  Private
const getQueueById = asyncHandler(async (req, res) => {
  const queue = await Queue.findOne({ _id: req.params.id, manager: req.userId });

  if (!queue) {
    res.status(404);
    throw new Error('Queue not found');
  }

  res.status(200).json({ success: true, data: queue });
});

// @desc    Delete a queue
// @route   DELETE /api/queues/:id
// @access  Private
const deleteQueue = asyncHandler(async (req, res) => {
  const queue = await Queue.findOneAndDelete({ _id: req.params.id, manager: req.userId });

  if (!queue) {
    res.status(404);
    throw new Error('Queue not found');
  }

  res.status(200).json({ success: true, data: {} });
});

module.exports = { createQueue, getQueues, getQueueById, deleteQueue };

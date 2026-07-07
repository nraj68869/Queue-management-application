const Token = require('../models/Token');
const Queue = require('../models/Queue');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get analytics for a single queue (wait times, current length, trends)
// @route   GET /api/queues/:id/analytics
// @access  Private
const getQueueAnalytics = asyncHandler(async (req, res) => {
  const queue = await Queue.findOne({ _id: req.params.id, manager: req.userId });
  if (!queue) {
    res.status(404);
    throw new Error('Queue not found');
  }

  const tokens = await Token.find({ queue: queue._id });

  const waitingCount = tokens.filter((t) => t.status === 'waiting').length;
  const servingCount = tokens.filter((t) => t.status === 'serving').length;
  const servedTokens = tokens.filter((t) => t.status === 'served' && t.calledAt && t.servedAt);
  const cancelledCount = tokens.filter((t) => t.status === 'cancelled').length;

  // Average wait time = time from joining the queue to being called
  const waitTimes = tokens
    .filter((t) => t.calledAt)
    .map((t) => (t.calledAt - t.createdAt) / 1000); // in seconds

  const avgWaitSeconds = waitTimes.length
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    : 0;

  // Average service time = time from being called to being served
  const serviceTimes = servedTokens.map((t) => (t.servedAt - t.calledAt) / 1000);
  const avgServiceSeconds = serviceTimes.length
    ? Math.round(serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length)
    : 0;

  // Queue length trend: number of tokens created per day (last 7 days)
  const today = new Date();
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const count = tokens.filter((t) => t.createdAt >= day && t.createdAt < nextDay).length;
    trend.push({ date: day.toISOString().split('T')[0], count });
  }

  res.status(200).json({
    success: true,
    data: {
      currentQueueLength: waitingCount,
      currentlyServing: servingCount,
      totalServedAllTime: servedTokens.length,
      totalCancelled: cancelledCount,
      avgWaitTimeSeconds: avgWaitSeconds,
      avgServiceTimeSeconds: avgServiceSeconds,
      last7DaysTrend: trend,
    },
  });
});

module.exports = { getQueueAnalytics };

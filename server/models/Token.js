const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true },
    personName: { type: String, required: true },

    // Position in the queue (lower number = closer to front)
    position: { type: Number, required: true },

    status: {
      type: String,
      enum: ['waiting', 'serving', 'served', 'cancelled'],
      default: 'waiting',
    },

    // Timestamps for analytics (wait time, service time, etc.)
    calledAt: { type: Date, default: null },   // when assigned for service
    servedAt: { type: Date, default: null },   // when marked complete
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true } // adds createdAt (= joinedAt) and updatedAt automatically
);

// Helpful compound index: fetching a queue's waiting tokens in order is the
// most frequent query in this app, so index it directly.
tokenSchema.index({ queue: 1, status: 1, position: 1 });

module.exports = mongoose.model('Token', tokenSchema);

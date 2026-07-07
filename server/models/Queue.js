const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', queueSchema);

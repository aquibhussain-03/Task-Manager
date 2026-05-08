const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

// Compound unique index — one role per user per project
teamSchema.index({ project: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    deadline: {
      type: Date,
      default: null,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Ensure owner is always in members
projectSchema.pre('save', function (next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);

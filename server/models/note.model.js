const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Add index on userId for faster retrieval
noteSchema.index({ userId: 1 });

module.exports = mongoose.model('Note', noteSchema);

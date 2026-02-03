import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 2000
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  downvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

replySchema.index({ discussion: 1, createdAt: -1 });

export default mongoose.model('Reply', replySchema);

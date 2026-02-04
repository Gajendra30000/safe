import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['safety-tips', 'housing-rent', 'recommendations', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
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
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: false
    }
  }
}, {
  timestamps: true
});

discussionSchema.index({ location: '2dsphere' });

discussionSchema.index({ title: 'text', content: 'text' });
discussionSchema.index({ category: 1 });
discussionSchema.index({ createdAt: -1 });

export default mongoose.model('Discussion', discussionSchema);

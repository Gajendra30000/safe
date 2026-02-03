import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['discussion', 'reply']
  },
  voteType: {
    type: String,
    required: true,
    enum: ['upvote', 'downvote']
  }
}, {
  timestamps: true
});

voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

voteSchema.statics.toggleVote = async function(userId: string, targetId: string, targetType: string, voteType: string) {
  const existingVote = await this.findOne({ user: userId, targetId, targetType });
  
  if (existingVote) {
    if (existingVote.voteType === voteType) {
      await existingVote.deleteOne();
      return { action: 'removed', vote: null };
    } else {
      existingVote.voteType = voteType;
      await existingVote.save();
      return { action: 'changed', vote: existingVote };
    }
  } else {
    const newVote = await this.create({ user: userId, targetId, targetType, voteType });
    return { action: 'added', vote: newVote };
  }
};

voteSchema.statics.getUserVotesForTargets = async function(userId: string, targetIds: string[], targetType: string) {
  const votes = await this.find({
    user: userId,
    targetId: { $in: targetIds },
    targetType
  });
  
  return votes.reduce((acc: any, vote: any) => {
    acc[vote.targetId.toString()] = vote.voteType;
    return acc;
  }, {});
};

export default mongoose.model('Vote', voteSchema);

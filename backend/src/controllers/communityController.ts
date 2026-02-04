import { Request, Response } from 'express';
import Discussion from '../models/Discussion';
import Reply from '../models/Reply';
import Vote from '../models/Vote';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, category, tags, latitude, longitude, imageUrl } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const discussionData: any = {
      title,
      content,
      author: userId,
      category: category || 'general',
      tags: tags || []
    };

    // Add image if provided
    if (imageUrl) {
      discussionData.imageUrl = imageUrl;
    }

    // Add location if provided
    if (latitude && longitude) {
      discussionData.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const discussion = await Discussion.create(discussionData);

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: populatedDiscussion
    });
  } catch (error: any) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: `${error.message}${error.errors ? ': ' + JSON.stringify(error.errors) : ''} | Stack: ${error.stack}`,
      errors: error.errors
    });
  }
};

export const getDiscussions = async (req: Request, res: Response) => {
  try {
    const { category, sort = 'recent', search, page = 1, limit = 20, radius, latitude, longitude } = req.query;
    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Add geolocation filter if radius and coordinates are provided
    if (radius && radius !== 'all' && latitude && longitude) {
      const radiusInMeters = Number(radius) * 1000; // Convert km to meters
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { upvotes: -1, views: -1 };
    } else if (sort === 'trending') {
      sortOption = { replyCount: -1, upvotes: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const discussions = await Discussion.find(query)
      .populate('author', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Discussion.countDocuments(query);

    res.json({
      success: true,
      data: discussions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions'
    });
  }
};

export const getDiscussionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion'
    });
  }
};

export const updateDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this discussion'
      });
    }

    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (tags) discussion.tags = tags;

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(id)
      .populate('author', 'name email');

    res.json({
      success: true,
      data: updatedDiscussion
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion'
    });
  }
};

export const deleteDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this discussion'
      });
    }

    await Reply.deleteMany({ discussion: id });
    await Vote.deleteMany({ targetId: id, targetType: 'discussion' });
    await discussion.deleteOne();

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion'
    });
  }
};

export const createReply = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const reply = await Reply.create({
      discussion: id,
      author: userId,
      content
    });

    await Discussion.findByIdAndUpdate(id, {
      $inc: { replyCount: 1 }
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: populatedReply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reply'
    });
  }
};

export const getReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sort = 'recent', page = 1, limit = 20 } = req.query;

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { upvotes: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const replies = await Reply.find({ discussion: id })
      .populate('author', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Reply.countDocuments({ discussion: id });

    res.json({
      success: true,
      data: replies,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies'
    });
  }
};

export const toggleVote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetId, targetType, voteType } = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!['discussion', 'reply'].includes(targetType) || !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote parameters'
      });
    }

    const Model: any = targetType === 'discussion' ? Discussion : Reply;
    const target = await Model.findById(targetId);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    const result = await (Vote as any).toggleVote(userId, targetId, targetType, voteType);

    if (result.action === 'removed') {
      const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
      await Model.findByIdAndUpdate(targetId, {
        $inc: { [updateField]: -1 }
      });
    } else if (result.action === 'added') {
      const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
      await Model.findByIdAndUpdate(targetId, {
        $inc: { [updateField]: 1 }
      });
    } else if (result.action === 'changed') {
      const oldField = voteType === 'upvote' ? 'downvotes' : 'upvotes';
      const newField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
      await Model.findByIdAndUpdate(targetId, {
        $inc: { [oldField]: -1, [newField]: 1 }
      });
    }

    const updatedTarget = await Model.findById(targetId);

    res.json({
      success: true,
      data: {
        action: result.action,
        upvotes: updatedTarget?.upvotes || 0,
        downvotes: updatedTarget?.downvotes || 0
      }
    });
  } catch (error) {
    console.error('Error toggling vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle vote'
    });
  }
};

export const getUserVotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetIds, targetType } = req.query;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!targetIds || !targetType) {
      return res.status(400).json({
        success: false,
        message: 'targetIds and targetType are required'
      });
    }

    const targetIdArray = (targetIds as string).split(',');
    const userVotes = await (Vote as any).getUserVotesForTargets(userId, targetIdArray, targetType);

    res.json({
      success: true,
      data: userVotes
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user votes'
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'frontend', name: 'Frontend', icon: '🎨', color: '#32CD32' },
      { id: 'backend', name: 'Backend', icon: '⚙️', color: '#1E90FF' },
      { id: 'ai', name: 'AI & ML', icon: '🤖', color: '#9333EA' },
      { id: 'safety', name: 'Safety', icon: '🛡️', color: '#DC2626' },
      { id: 'general', name: 'General', icon: '💭', color: '#6B7280' },
      { id: 'bugs', name: 'Bug Reports', icon: '🐛', color: '#F59E0B' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

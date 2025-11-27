import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { validationResult } from 'express-validator';

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId,
      parentComment: null // Only get top-level comments
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, parentComment } = req.body;
    const postId = req.params.postId;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
      parentComment: parentComment || null
    });

    await comment.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/posts/:postId/comments/:commentId
// @access  Private
export const updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { 
        content: req.body.content,
        isEdited: true 
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating comment'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Also delete any nested comments (replies)
    await Comment.deleteMany({ parentComment: req.params.commentId });

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment'
    });
  }
};
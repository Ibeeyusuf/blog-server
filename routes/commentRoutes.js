import express from 'express';
import { body } from 'express-validator';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';
import authMiddleware from '../middleware/auth.js'; // Renamed to avoid conflict
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

// Validation rules
const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// Routes
router.get('/', getComments);
router.post('/', authMiddleware, commentValidation, handleValidationErrors, addComment);
router.put('/:commentId', authMiddleware, commentValidation, handleValidationErrors, updateComment);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
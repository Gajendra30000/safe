import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  addComment,
  getUserIncidents,
} from '../controllers/incidentController';
import { optionalAuth, protect } from '../middleware/auth';

const router = express.Router();

// Public routes (with optional auth for anonymous reporting)
router.post('/', optionalAuth, createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);

// Protected routes (require authentication)
router.post('/:id/comments', optionalAuth, addComment);
router.get('/user/my-reports', protect, getUserIncidents);

export default router;

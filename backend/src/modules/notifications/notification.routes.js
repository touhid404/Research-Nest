import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from './notification.controller.js';
import authCheck from '../../middleware/authCheck.js';

const router = express.Router();

// All routes require authentication
router.get('/', authCheck(), getUserNotifications);
router.patch('/:id/read', authCheck(), markAsRead);
router.patch('/read-all', authCheck(), markAllAsRead);

export default router;

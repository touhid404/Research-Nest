import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from './notification.controller.js';

const router = express.Router();

// All routes require x-user-id header check in controller
router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;

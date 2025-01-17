// routes/notificationRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread', authenticate, notificationController.getUnreadNotifications);
router.put('/read/:id', authenticate, notificationController.markNotificationAsRead);
router.put('/all/read', authenticate, notificationController.markAllNotificationsAsRead);

module.exports = router;

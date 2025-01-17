// controllers/notificationController.js

const Notification = require('../models/notification');
const User = require('../models/user');
const Post = require('../models/post'); // <-- IMPORT MANQUANT AJOUTÉ

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'actor', attributes: ['username', 'avatar'] },
                { model: Post, as: 'post', attributes: ['id', 'content'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findOne({
            where: { id, userId: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

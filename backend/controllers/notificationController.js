// controllers/notificationController.js

const Notification = require('../models/notification');
const User = require('../models/user');
const Post = require('../models/post'); // <-- IMPORT MANQUANT AJOUTÉ

/**
 * Récupère toutes les notifications de l'utilisateur connecté.
 * 
 * Cette fonction récupère toutes les notifications de l'utilisateur
 * actuellement connecté (identifié par `req.user.id`). Elle inclut les informations
 * sur l'utilisateur ayant généré la notification (`actor`) et le post associé à chaque
 * notification, et renvoie les notifications triées par date de création, de la plus récente à la plus ancienne.
 * 
 * @param {Object} req - Requête HTTP contenant l'utilisateur connecté (via le token).
 * @param {Object} res - Réponse HTTP renvoyant les notifications de l'utilisateur.
 * @returns {Object} - Objet JSON contenant toutes les notifications de l'utilisateur avec les informations associées.
 */
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'actor', attributes: ['username', 'avatar', 'address'] },
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

/**
 * Récupère toutes les notifications non lues de l'utilisateur connecté.
 * 
 * Cette fonction permet de récupérer uniquement les notifications non lues de l'utilisateur
 * actuellement connecté. Elle inclut les informations de l'utilisateur ayant généré la notification
 * (`actor`) ainsi que les détails du post associé à chaque notification. Les notifications sont triées
 * par date de création, de la plus récente à la plus ancienne.
 * 
 * @param {Object} req - Requête HTTP contenant l'utilisateur connecté (via le token).
 * @param {Object} res - Réponse HTTP renvoyant les notifications non lues de l'utilisateur.
 * @returns {Object} - Objet JSON contenant les notifications non lues de l'utilisateur avec les informations associées.
 */
exports.getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id, read: false },
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

/**
 * Marque toutes les notifications de l'utilisateur connecté comme lues.
 * 
 * Cette fonction permet de marquer toutes les notifications de l'utilisateur connecté comme lues.
 * Elle met à jour le champ `read` de chaque notification de l'utilisateur à `true`.
 * Si aucune notification n'est trouvée pour l'utilisateur, une erreur 404 est renvoyée.
 * 
 * @param {Object} req - Requête HTTP contenant l'utilisateur connecté (via le token).
 * @param {Object} res - Réponse HTTP indiquant si l'opération a réussi ou échoué.
 * @returns {Object} - Objet JSON contenant le message de succès après la mise à jour des notifications.
 */
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
        });

        if (!notifications || notifications.length == 0) {
            return res.status(404).json({ error: 'No notification found' });
        }
        
        // Met à jour toutes les notifications pour l'utilisateur comme lues
        notifications.forEach(async n => {
            n.read = true;
            await n.save();   
        });

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

/**
 * Marque une notification spécifique comme lue.
 * 
 * Cette fonction permet de marquer une notification particulière (identifiée par son ID) comme lue
 * pour l'utilisateur connecté. Si la notification n'existe pas ou ne correspond pas à l'utilisateur, une erreur 404 est renvoyée.
 * 
 * @param {Object} req - Requête HTTP contenant l'ID de la notification à marquer comme lue (dans les paramètres).
 * @param {Object} res - Réponse HTTP indiquant si l'opération a réussi ou échoué.
 * @returns {Object} - Objet JSON contenant un message de succès après la mise à jour de la notification.
 */
exports.markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findOne({
            where: { id, userId: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Marque la notification comme lue
        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

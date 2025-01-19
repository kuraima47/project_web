// services/notificationService.js

const Notification = require('../models/notification');
const User = require('../models/user');
const Post = require('../models/post');
const { getIoNotifications } = require('../socket');
const { getSocketIdFromUserId } = require('../websockets/notifications');

/**
 * Crée une nouvelle notification dans la base de données et l'envoie en temps réel à l'utilisateur concerné.
 * 
 * @param {string} type - Le type de notification (ex: 'like', 'comment', 'follow', etc.).
 * @param {number} userId - L'identifiant de l'utilisateur qui recevra la notification.
 * @param {number} actorId - L'identifiant de l'utilisateur qui effectue l'action.
 * @param {number|null} postId - L'identifiant du post concerné (si applicable).
 * @param {number|null} commentId - L'identifiant du commentaire concerné (si applicable).
 * @returns {Promise<Notification>} - La notification créée.
 * @throws {Error} - Si une erreur survient lors de la création de la notification.
 */
exports.createNotification = async (type, userId, actorId, postId = null, commentId = null) => {
  try {

    if(userId == actorId) return;

    // Créer la notification dans la base de données
    const notification = await Notification.create({
      type,
      userId,       // L'utilisateur qui recevra la notification
      actorId,      // L'utilisateur qui effectue l'action
      postId,       // Le post concerné (s'il y en a un)
      commentId,    // Le commentaire concerné (s'il y en a un)
    });

    // Récupérer les informations de l'utilisateur acteur et les objets post/commentaire associés
    const actor = await User.findByPk(actorId);
    let post = null;
    if (postId != null) post = await Post.findByPk(postId);

    let comment = null;
    if (commentId != null) comment = await Post.findByPk(commentId);

    // Déterminer le message à envoyer en fonction du type de notification
    let message = "";
    switch (type) {
      case 'like':
        message = "a liké votre post : " + post.content.substring(0, 40);  // Trim et limité à 40 caractères
        break;
      case 'comment':
        message = "a commenté votre post : \'" + comment.content.substring(0, 20) + "[...]\'";
        break;
      case 'repost':
        message = "a reposté votre post : " + post.content.substring(0, 40);
        break;
      case 'follow':
        message = "vous a suivi";
        break;
      case 'unfollow':
        message = "vous a supprimé";
        break;
      case 'message': 
        message = "vous a envoyé un message";
        break;
      default:
        message = "Action inconnue";
    }

    // Déterminer le lien vers le post ou le commentaire
    let hrefValue = "";
    if (postId != null) hrefValue = `/posts/${postId}`;
    if (commentId != null) hrefValue = `/posts/${commentId}`;

    // Envoie la notification en temps réel via WebSocket
    sendRealTimeNotification(userId, type, actor, message, hrefValue);

    // Retourne la notification créée
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};

/**
 * Envoie une notification en temps réel via WebSocket à l'utilisateur concerné.
 * 
 * @param {number} userId - L'identifiant de l'utilisateur qui recevra la notification.
 * @param {string} type - Le type de notification.
 * @param {Object} actor - L'objet représentant l'utilisateur qui effectue l'action (acteurs de la notification).
 * @param {string} message - Le message de la notification.
 * @param {string} hrefValue - Le lien vers le contenu associé à la notification (ex: un post ou un commentaire).
 */
function sendRealTimeNotification(userId, type, actor, message, hrefValue) {
  console.log("Envoi notification pour l'utilisateur : " + userId + " Type : " + type);
  
  // Envoie la notification via WebSocket
  getIoNotifications().to(getSocketIdFromUserId(userId)).emit('receiveNotification', {type, actor, message, hrefValue });
}

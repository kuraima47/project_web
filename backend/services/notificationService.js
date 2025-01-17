// services/notificationService.js

const Notification = require('../models/notification');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const ioNotifications = require('../index');
// Fonction pour créer une notification


exports.createNotification = async (type, userId, actorId, postId=null, commentId = null) => {
  try {
    // Créer la notification
    const notification = await Notification.create({
      type,
      userId,       // L'utilisateur qui recevra la notification
      actorId,      // L'utilisateur qui effectue l'action
      postId,       // Le post concerné
      commentId,    // Le commentaire concerné (s'il y en a un)
    });


    console.log(type);
    console.log(userId);
    console.log(actorId);
    console.log(postId);
    console.log(commentId);

    console.log("IO NOTIF "+ioNotifications);

    // Vous pouvez ajouter ici une logique pour envoyer la notification via WebSocket
    // par exemple, via un serveur WebSocket d'événements en temps réel

    const actor = await User.findByPk(actorId);
    let post = null;
    if(postId != null)
      post = await Post.findByPk(postId);

  

    let comment = null;
    if(commentId != null)
      comment = await Comment.findByPk(commentId);

    let message = "";
    switch (type) {
      case 'like':
          message = "a liké votre post : " + post.content.substring(0, 40);  // Trim et limité à 40 caractères
          break;
      case 'comment':
          message = "a commenté votre post : " + post.content.substring(0, 20) + " ... >> " + commentContent.substring(0, 20) + "...";
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
      default:
          message = "Action inconnue";
  }

    sendRealTimeNotification(userId, type, actor, message);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

// Fonction pour envoyer la notification en temps réel via WebSocket
function sendRealTimeNotification(userId, type, actor, message) {
  ioNotifications.to(userId.toString()).emit('receiveNotification', { type, actor, message });
}


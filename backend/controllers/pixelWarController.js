// controllers/pixelWarController.js

const { Op } = require('sequelize');
const { Pixel, User} = require('../models');

const { getIoPixelWar } = require('../socket');

const pixelWarController = {
  /**
   * Permet à un utilisateur de poser un pixel sur la grille.
   * 
   * Cette fonction vérifie d'abord la validité des données envoyées (les coordonnées
   * x et y ainsi que la couleur doivent être valides). Ensuite, elle limite l'utilisateur
   * à poser un maximum de 50 pixels par heure. Si l'utilisateur a déjà posé le maximum,
   * il doit attendre une heure avant de pouvoir poser un autre pixel. Si la position
   * (x, y) est déjà occupée par un autre pixel, celui-ci est supprimé et remplacé par
   * le nouveau pixel.
   * 
   * @param {Object} req - Requête HTTP contenant les informations nécessaires : `x`, `y`, `color`.
   * @param {Object} res - Réponse HTTP renvoyant un message de succès ou d'erreur.
   * @returns {Object} - Réponse JSON avec le message de succès ou d'erreur.
   */
  placePixel: async (req, res) => {
    try {
      const userId = req.user.id;
      const { x, y, color } = req.body;

      // Vérification de la validité des données
      if (typeof x !== 'number' || typeof y !== 'number' || !color || !userId) {
        return res.status(400).json({ error: 'Données invalides' });
      }

      // Créer un nouveau pixel dans la base de données
      const existPixel = await Pixel.findOne({ where: { x: x, y: y } });
      if (existPixel) {
        // Si le pixel existe déjà, on le supprime avant d'en créer un nouveau
        await existPixel.destroy();
      }

      // Créer un nouveau pixel
      const newPixel = await Pixel.create({ x, y, color, userId });
      
      // Emission d'un événement de pixel posé pour tous les utilisateurs via WebSocket
      getIoPixelWar().emit('newPixel', { x, y, color, userId });

      return res.status(201).json({ message: 'Pixel posé avec succès', pixel: newPixel });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  /**
   * Récupère tous les pixels posés jusqu'à présent.
   * 
   * Cette fonction permet de récupérer tous les pixels enregistrés dans la base de données,
   * triés par date de pose, et retourne ces pixels sous forme de tableau. Chaque pixel contient
   * les informations suivantes : coordonnées (`x`, `y`), couleur, ID de l'utilisateur et timestamp.
   * 
   * @param {Object} req - Requête HTTP (aucune donnée nécessaire).
   * @param {Object} res - Réponse HTTP contenant la liste des pixels.
   * @returns {Object} - Réponse JSON contenant tous les pixels triés par date.
   */
  getPixels: async (req, res) => {
    try {
      const pixels = await Pixel.findAll({
        attributes: ['x', 'y', 'color', 'userId', 'timestamp'],
        order: [['timestamp', 'ASC']], // Trier par date de pose
      });

      return res.status(200).json(pixels);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

module.exports = pixelWarController;

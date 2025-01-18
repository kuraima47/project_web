const { Op } = require('sequelize');
const Pixel = require('../models/pixel');
const User = require('../models/user');

const { getIoPixelWar } = require('../socket');
const { getSocketIdFromUserId } = require('../websockets/pixelwar')

const pixelWarController = {
  // Fonction pour poser un pixel
  placePixel: async (req, res) => {
    try {
      const userId = req.user.id;
      const { x, y, color } = req.body;

      // Vérification de la validité des données
      if (typeof x !== 'number' || typeof y !== 'number' || !color || !userId) {
        return res.status(400).json({ error: 'Données invalides' });
      }

      // Limiter à 10 pixels par heure
      const oneHourAgo = new Date(Date.now() - 3600000); // 1 heure en millisecondes
      const recentPixels = await Pixel.count({
        where: {
          userId,
          timestamp: {
            [Op.gt]: oneHourAgo,
          },
        },
      });

      if (recentPixels >= 50) {
        return res.status(400).json({ error: 'Vous devez attendre 1 heure avant de pouvoir reposer vos pixels. (ou alors attendre qu\'ils soient recouverts)' });
      }

      // Créer un nouveau pixel dans la base de données

      const existPixel = await Pixel.findOne({ where: { x:x, y:y}})
      if(existPixel) {
        await existPixel.destroy();
      }
      const newPixel = await Pixel.create({x,y,color,userId});
      
      
      getIoPixelWar().emit('newPixel', {x,y,color,userId});
      

      return res.status(201).json({ message: 'Pixel posé avec succès', pixel: newPixel });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Fonction pour récupérer tous les pixels
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

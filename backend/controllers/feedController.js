const { getGeneralFeedForUser } = require('../services/feedService');
const User = require('../models/user');

/**
 * Récupère le flux général des posts pour un utilisateur.
 * 
 * Cette fonction récupère d'abord l'utilisateur connecté à partir du token d'authentification 
 * (décodé via un middleware) ou à partir de `req.params` / `query` (selon votre conception).
 * Ensuite, elle récupère un flux général (limité à 200 posts) en appelant un service 
 * qui génère ce feed en fonction de l'utilisateur.
 * 
 * Si l'utilisateur est trouvé, le flux des posts lui est renvoyé dans la réponse.
 * Si l'utilisateur n'est pas trouvé ou si une erreur survient lors du processus, 
 * un message d'erreur est retourné.
 * 
 * @param {Object} req - Requête HTTP contenant les informations nécessaires pour récupérer le flux.
 * @param {Object} res - Réponse HTTP qui renverra le flux général ou une erreur.
 * @returns {Object} Flux général des posts ou message d'erreur.
 */
exports.getGeneralFeed = async (req, res) => {
    try {
        // userId depuis le token décodé (middleware d'auth, par ex)
        // ou depuis req.params / query, selon ton design
        const userId = req.user.id;

        // 1) Récupérer le user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2) Récupérer le feed général
        //    => 200 posts max (ex) pour limiter la charge
        const feed = await getGeneralFeedForUser(user, 200);

        // 3) Retourner le résultat
        return res.json(feed);
    } catch (error) {
        console.error('Error in getGeneralFeed:', error);
        return res.status(500).json({ error: 'Failed to fetch feed' });
    }
};

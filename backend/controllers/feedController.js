// controllers/feedController.js
const { getGeneralFeedForUser } = require('../services/feedService');
const User = require('../models/user');

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

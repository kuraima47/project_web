// controllers/interestController.js

const Interest = require('../models/Interest');

/**
 * POST /api/interests
 * Body: { name: "Blockchain" }
 * => Crée un nouvel intérêt (ou renvoie l'existant si unique)
 */
exports.createInterest = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // findOrCreate => soit on trouve l'intérêt existant, soit on le crée
        const [interest, created] = await Interest.findOrCreate({
            where: { name: name.toLowerCase() },
            defaults: { name: name.toLowerCase() }
        });

        return res.status(201).json({ interest, created });
    } catch (error) {
        console.error('Error creating interest:', error);
        return res.status(500).json({ error: 'Failed to create interest' });
    }
};

const Interest = require('../models/interest');

/**
 * Crée un nouvel intérêt ou retourne l'intérêt existant si l'élément est unique.
 * 
 * Cette fonction permet de créer un nouvel intérêt basé sur le nom fourni dans 
 * la requête. Si l'intérêt avec le même nom existe déjà, la fonction retourne 
 * cet intérêt existant. Sinon, elle crée un nouvel intérêt et le retourne dans 
 * la réponse.
 * 
 * Le nom de l'intérêt doit être spécifié dans le corps de la requête sous la 
 * forme d'un objet JSON, par exemple `{ name: "Blockchain" }`.
 * 
 * Si le nom est manquant, une erreur de validation 400 est renvoyée.
 * En cas d'erreur lors de la création ou de la recherche de l'intérêt, une erreur 
 * serveur 500 est retournée.
 * 
 * @param {Object} req - Requête HTTP contenant le nom de l'intérêt à créer ou rechercher.
 * @param {Object} res - Réponse HTTP contenant l'intérêt créé ou trouvé, ou un message d'erreur.
 * @returns {Object} - Objet JSON contenant l'intérêt créé ou trouvé, avec un champ `created` 
 *                     indiquant si l'intérêt a été créé ou non.
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

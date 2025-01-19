// controllers/searchController.js

const { Op } = require('sequelize');
const {User,Post,Hashtag,sequelize} = require('../models');


/**
 * Recherche dans les utilisateurs, posts et hashtags en fonction du terme de recherche et du type spécifié.
 * 
 * Cette fonction prend en compte le paramètre `term` (le terme de recherche) et `type` (le type de recherche, 
 * qui peut être 'all', 'user', 'post', ou 'hashtag'). Selon le type choisi, elle effectue une recherche dans les 
 * utilisateurs, les posts ou les hashtags, et retourne les résultats sous forme de tableau.
 * 
 * @param {Object} req - La requête HTTP contenant les paramètres `term` et `type`.
 * @param {Object} res - La réponse HTTP retournant les résultats de la recherche.
 * @returns {Object} Les résultats de la recherche sous forme de tableau de résultats.
 */
exports.search = async (req, res) => {
    const { term, type } = req.query; // Extraction des paramètres de recherche 'term' et 'type' de la requête
    try {
        let results = []; // Tableau pour stocker les résultats de recherche

        // Recherche des utilisateurs si le type est 'all' ou 'user'
        if (type === 'all' || type === 'user') {
            // Recherche des utilisateurs dont le nom d'utilisateur ou la bio correspond au terme
            const users = await User.findAll({
                where: {
                    [Op.or]: [
                        { username: { [Op.like]: `%${term}%` } }, // Correspondance avec le nom d'utilisateur
                        { bio: { [Op.like]: `%${term}%` } } // Correspondance avec la bio
                    ]
                },
                attributes: ['id', 'address', 'username', 'avatar', 'bio'] // Sélection des attributs à retourner
            });
            // Ajout des résultats dans le tableau 'results' avec le type 'user'
            results.push(...users.map(u => ({ ...u.toJSON(), type: 'user' })));
        }

        // Recherche des posts si le type est 'all' ou 'post'
        if (type === 'all' || type === 'post') {
            // Recherche des posts dont le contenu correspond au terme
            const posts = await Post.findAll({
                where: {
                    content: { [Op.like]: `%${term}%` } // Correspondance avec le contenu du post
                },
                include: [{ model: User, as: 'author', attributes: ['username', 'avatar'] }], // Inclusion des informations de l'auteur du post
                attributes: ['id', 'content', 'createdAt'] // Sélection des attributs du post à retourner
            });
            // Ajout des résultats dans le tableau 'results' avec le type 'post' et les infos de l'auteur
            results.push(...posts.map(post => ({
                ...post.toJSON(),
                type: 'post',
                username: post.author.username,
                avatar: post.author.avatar,
                timestamp: post.createdAt
            })));
        }

        // Recherche des hashtags si le type est 'all' ou 'hashtag'
        if (type === 'all' || type === 'hashtag') {
            // Recherche des hashtags dont le nom correspond au terme
            const hashtags = await Hashtag.findAll({
                where: {
                    name: { [Op.like]: `%${term}%` } // Correspondance avec le nom du hashtag
                },
                attributes: [
                    'name', // Nom du hashtag
                    [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'count'] // Nombre de posts associés au hashtag
                ],
                include: [{ model: Post, attributes: [] }], // Inclusion des posts associés (sans attribuer de champs à retourner)
                group: ['Hashtag.id'], // Regroupement des résultats par hashtag
                raw: true // Retourne les résultats sous forme brute
            });
            // Ajout des résultats dans le tableau 'results' avec le type 'hashtag'
            results.push(...hashtags.map(h => ({ ...h, type: 'hashtag' })));
        }

        // Retour des résultats sous forme de réponse JSON
        res.json(results);
    } catch (error) {
        // Gestion des erreurs
        console.error('Search error:', error); // Affichage de l'erreur dans la console
        return res.status(500).json({ error: 'An error occurred while searching' }); // Retour d'une réponse d'erreur HTTP
    }
};

// services/feedService.js

const { Op } = require('sequelize');
const Post = require('../models/post');
const UserInterest = require('../models/userInterest');
const Interest = require('../models/interest');
const Hashtag = require('../models/hashtag');
const moment = require('moment');

/**
 * Récupère un feed "général" pour l'utilisateur donné.
 * Ce feed est basé sur les posts récents, leur popularité, ainsi que leur adéquation avec les intérêts de l'utilisateur.
 * Le score de chaque post est calculé en fonction de la popularité (likes, reposts), de la récence et des intérêts de l'utilisateur.
 * 
 * @param {Object} user - L'utilisateur pour lequel on récupère le feed.
 * @param {number} [limit=200] - Le nombre maximal de posts à récupérer (par défaut 200).
 * @returns {Promise<Array>} - Une liste de posts triée par score décroissant.
 */
async function getGeneralFeedForUser(user, limit = 200) {
    // 1) Récupérer les posts (les plus récents) avec leurs hashtags associés.
    const posts = await Post.findAll({
        include: [{ model: Hashtag, as: 'Hashtags', through: { attributes: [] } }],
        order: [['createdAt', 'DESC']],
        limit
    });

    // 2) Récupérer les intérêts de l’utilisateur avec leur score
    const userInterests = await UserInterest.findAll({
        where: { userId: user.id },
        include: [{ model: Interest }]
    });

    // Construire une carte des scores d'intérêts de l'utilisateur
    const interestScoreMap = {};
    userInterests.forEach((ui) => {
        interestScoreMap[ui.Interest.name] = ui.score;
    });

    // 3) Calculer un score pour chaque post
    const scoredPosts = posts.map((post) => {
        const score = computePostScore(post, interestScoreMap, user);
        return { post, score };
    });

    // 4) Trier les posts par score décroissant
    scoredPosts.sort((a, b) => b.score - a.score);

    // 5) Retourner la liste des posts triée par score
    return scoredPosts.map((item) => item.post);
}

/**
 * Calcule un score pour un post donné, en fonction de la popularité, de la récence,
 * et des intérêts de l'utilisateur.
 * 
 * @param {Object} post - Le post pour lequel calculer le score.
 * @param {Object} interestScoreMap - Un objet map représentant les scores d'intérêts de l'utilisateur.
 * @param {Object} user - L'utilisateur pour lequel le score est calculé.
 * @returns {number} - Le score calculé pour le post.
 */
function computePostScore(post, interestScoreMap, user) {
    let score = 0;

    // A) Popularité (ex: +1 par like, +2 par repost)
    score += (post.likes || 0) * 1;
    score += (post.reposts || 0) * 2;

    // B) Récence : bonus en fonction de l'ancienneté du post
    const now = moment();
    const postCreation = moment(post.createdAt);
    const hoursOld = now.diff(postCreation, 'hours');
    score -= hoursOld * 0.1;

    // C) Match avec les intérêts de l'utilisateur
    if (post.Hashtags && post.Hashtags.length) {
        for (const hashtag of post.Hashtags) {
            const tagName = hashtag.name.toLowerCase();
            const userIntScore = interestScoreMap[tagName] || 0;
            score += userIntScore;
        }
    }

    // D) Facteur aléatoire pour favoriser la découverte
    const randomFactor = Math.random();
    score += randomFactor * 1;

    return score;
}

module.exports = {
    getGeneralFeedForUser
};

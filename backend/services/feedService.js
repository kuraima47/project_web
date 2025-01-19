// services/feedService.js
const moment = require('moment');
const { Op } = require('sequelize');
const { Post, UserInterest, Interest, Hashtag, User} = require('../models');

async function getGeneralFeedForUser(user, limit = 200) {
    // 1) Récupérer les posts (les plus récents) avec leurs hashtags associés.
    const posts = await Post.findAll({
        where: { parentPostId: null }, // Ne récupérer que les posts racines
        include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'avatar', 'address'],
            },
            {
                model: Post,
                as: 'responses',
                include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
            },
            {
                model: Hashtag,
                as: 'Hashtags',
                attributes: ['name'],
                through: { attributes: [] },
            },
        ],
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
        const score = computePostScore(post, interestScoreMap);
        return { post, score };
    });

    // 4) Trier les posts par score décroissant
    scoredPosts.sort((a, b) => b.score - a.score);

    // 5) Retourner la liste des posts triée par score
    return scoredPosts.map((item) => item.post);
}

function computePostScore(post, interestScoreMap) {
    let score = 0;

    // A) Popularité
    score += (post.likes   || 0) * 1;
    score += (post.reposts || 0) * 2;

    // B) Récence
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

    // D) Facteur aléatoire
    score += Math.random();

    return score;
}

module.exports = {
    getGeneralFeedForUser
};

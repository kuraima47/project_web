// services/feedService.js
const { Op } = require('sequelize');
const Post = require('../models/post');
const UserInterest = require('../models/userInterest');
const Interest = require('../models/interest');
const Hashtag = require('../models/hashtag');
const moment = require('moment'); // pour manipuler plus facilement les dates (optionnel)

/**
 * Récupère un feed "général" pour l'utilisateur `user`.
 *  - On récupère une liste de posts (par ex. les 200 plus récents)
 *  - On calcule un score pour chacun en fonction de:
 *    - popularité (likes, reposts)
 *    - recence
 *    - matching avec les intérêts de l'utilisateur
 */
async function getGeneralFeedForUser(user, limit = 200) {
    // 1) Récupérer les posts (les plus récents) avec leurs hashtags
    //    NB: on peut aussi inclure d’autres infos: likedBy, etc.
    const posts = await Post.findAll({
        include: [{ model: Hashtag, as: 'Hashtags', through: { attributes: [] } }],
        order: [['createdAt', 'DESC']],
        limit
    });

    // 2) Récupérer les intérêts (et leur score) de l’utilisateur
    //    => user.getInterests() ... ou requête directe sur UserInterest
    const userInterests = await UserInterest.findAll({
        where: { userId: user.id },
        include: [{ model: Interest }]
        // => on aura userInterests[i].Interest.name et userInterests[i].score
    });

    // Construire un petit map { [interestName]: score }
    // => ex: { blockchain: 5, music: 2, ai: 10, ... }
    const interestScoreMap = {};
    userInterests.forEach((ui) => {
        interestScoreMap[ui.Interest.name] = ui.score;
    });

    // 3) Pour chaque post, calculer un score
    const scoredPosts = posts.map((post) => {
        const score = computePostScore(post, interestScoreMap, user);
        return { post, score };
    });

    // 4) Trier par score décroissant
    scoredPosts.sort((a, b) => b.score - a.score);

    // 5) Renvoyer les posts sous forme d’un array final
    return scoredPosts.map((item) => item.post);
}

/**
 * Fonction qui calcule un "score" pour un post donné,
 * compte-tenu des intérêts de l'utilisateur (interestScoreMap), etc.
 */
function computePostScore(post, interestScoreMap, user) {
    let score = 0;

    // A) Popularité (ex: +1 par like, +2 par repost)
    //    Si tu as un champ post.likes, post.reposts
    score += (post.likes || 0) * 1;
    score += (post.reposts || 0) * 2;

    // B) Recence : on peut donner un bonus si le post est récent
    //    Ex: -0.1 point par heure d'ancienneté
    const now = moment();
    const postCreation = moment(post.createdAt);
    const hoursOld = now.diff(postCreation, 'hours');
    score -= hoursOld * 0.1;

    // C) Match avec les intérêts de l'utilisateur
    //    => On sum le score de l'utilisateur pour chaque hashtag du post
    if (post.Hashtags && post.Hashtags.length) {
        for (const hashtag of post.Hashtags) {
            const tagName = hashtag.name.toLowerCase();
            const userIntScore = interestScoreMap[tagName] || 0;
            // On peut simplement additionner
            score += userIntScore;
            // Ou faire un ratio, ou multiplier par un coeff
        }
    }

    // D) Optionnel : un petit facteur aléatoire pour la découverte
    //    => ex: +0 à +1 random
    const randomFactor = Math.random();
    score += randomFactor * 1;

    return score;
}

module.exports = {
    getGeneralFeedForUser
};

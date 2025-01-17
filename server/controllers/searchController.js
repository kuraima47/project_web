// controllers/searchController.js

const { Op } = require('sequelize');
const User = require('../models/user');
const Post = require('../models/post');
const Hashtag = require('../models/hashtag');
const sequelize = require('../config/database');

exports.search = async (req, res) => {
    const { term, type } = req.query;
    try {
        let results = [];

        if (type === 'all' || type === 'user') {
            const users = await User.findAll({
                where: {
                    [Op.or]: [
                        { username: { [Op.like]: `%${term}%` } },
                        { bio: { [Op.like]: `%${term}%` } }
                    ]
                },
                attributes: ['id',  'address', 'username', 'avatar', 'bio']
            });
            results.push(...users.map(u => ({ ...u.toJSON(), type: 'user' })));
        }

        if (type === 'all' || type === 'post') {
            const posts = await Post.findAll({
                where: {
                    content: { [Op.like]: `%${term}%` }
                },
                include: [{ model: User, as: 'author', attributes: ['username', 'avatar'] }],
                attributes: ['id', 'content', 'createdAt']
            });
            results.push(...posts.map(post => ({
                ...post.toJSON(),
                type: 'post',
                username: post.author.username,
                avatar: post.author.avatar,
                timestamp: post.createdAt
            })));
        }

        if (type === 'all' || type === 'hashtag') {
            const hashtags = await Hashtag.findAll({
                where: {
                    name: { [Op.like]: `%${term}%` }
                },
                attributes: [
                    'name',
                    [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'count']
                ],
                include: [{ model: Post, attributes: [] }],
                group: ['Hashtag.id'],
                raw: true
            });
            results.push(...hashtags.map(h => ({ ...h, type: 'hashtag' })));
        }

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'An error occurred while searching' });
    }
};

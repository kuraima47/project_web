const { Post, User } = require('../models');
const { format } = require('date-fns');

/**
 * Fetches posts with associated data and formats them.
 * @param {Object} options - Options for fetching posts (e.g., limit, order).
 * @returns {Array} Formatted posts.
 */
exports.fetchAndFormatPosts = async (options) => {
  const posts = await Post.findAll({
    ...options,
    attributes: ['id', 'content', 'createdAt'],
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['username', 'displayName', 'profilePicture'], // Inclure l'avatar de l'auteur
      },
      {
        model: User,
        as: 'likedBy',
        attributes: [],
        through: { attributes: [] },
      },
      {
        model: User,
        as: 'retweetedBy',
        attributes: [],
        through: { attributes: [] },
      },
      {
        model: Post,
        as: 'comments',
        attributes: ['id'],
      },
    ],
  });

  return posts.map((post) => {
    const postCreatedAt = new Date(post.createdAt);
    const formattedDate = format(postCreatedAt, 'dd-MM-yyyy HH:mm');

    return {
      id: post.id,
      author: post.author?.username || 'Unknown',
      displayName: post.author?.displayName || 'Unknown',
      profilePicture: post.author?.profilePicture || null, // Inclure l'avatar dans le résultat
      content: post.content || '',
      timestamp: formattedDate,
      likes: Array.isArray(post.likedBy) ? post.likedBy.length : 0,
      comments: Array.isArray(post.comments) ? post.comments.length : 0,
      retweets: Array.isArray(post.retweetedBy) ? post.retweetedBy.length : 0,
    };
  });
};

/**
 * Creates a new post and fetches it with full details.
 * @param {Object} postData - Data for creating a new post.
 * @returns {Object} Formatted post.
 */
exports.createAndFetchPost = async (postData) => {
  const newPost = await Post.create(postData);

  const postWithDetails = await Post.findByPk(newPost.id, {
    attributes: ['id', 'content', 'createdAt'],
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['username', 'displayName', 'profilePicture'], // Inclure l'avatar de l'auteur
      },
      {
        model: User,
        as: 'likedBy',
        attributes: [],
        through: { attributes: [] },
      },
      {
        model: User,
        as: 'retweetedBy',
        attributes: [],
        through: { attributes: [] },
      },
      {
        model: Post,
        as: 'comments',
        attributes: ['id'],
      },
    ],
  });

  const postCreatedAt = new Date(postWithDetails.createdAt);
  const formattedDate = format(postCreatedAt, 'dd-MM-yyyy HH:mm');

  return {
    id: postWithDetails.id,
    author: postWithDetails.author?.username || 'Unknown',
    profilePicture: postWithDetails.author?.profilePicture || null, // Inclure l'avatar dans le résultat
    content: postWithDetails.content || '',
    timestamp: formattedDate,
    likes: Array.isArray(postWithDetails.likedBy) ? postWithDetails.likedBy.length : 0,
    comments: Array.isArray(postWithDetails.comments) ? postWithDetails.comments.length : 0,
    retweets: Array.isArray(postWithDetails.retweetedBy) ? postWithDetails.retweetedBy.length : 0,
  };
};

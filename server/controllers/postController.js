// controllers/postController.js

const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const Hashtag = require('../models/hashtag');
// Optionnel, si on utilise la table de jointure comme ci-dessus :
// const { Op } = require('sequelize');

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'address']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'username', 'avatar']
          }]
        },
        {
          model: Hashtag,
          attributes: ['name'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.createPost = async (req, res) => {
  const { content } = req.body;
  const media = req.file ? req.file.filename : null;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const post = await Post.create({
      content,
      media,
      authorId: user.id, // on utilise authorId
    });

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g) || [];
    for (let tag of hashtags) {
      tag = tag.slice(1).toLowerCase();
      const [hashtag] = await Hashtag.findOrCreate({ where: { name: tag } });
      await post.addHashtag(hashtag);
    }

    const fullPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
        { model: Hashtag, attributes: ['name'], through: { attributes: [] } }
      ],
    });

    res.status(201).json(fullPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['username', 'avatar'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['username', 'avatar'] }],
          order: [['createdAt', 'DESC']]
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

exports.likePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // On suppose qu'on a défini la relation belongsToMany "likedBy"
    // post.addLikedBy(req.user) pour le like
    await post.addLikedBy(req.user);

    // Créer une notification
    await Notification.create({
      type: 'like',
      userId: post.authorId,      // le propriétaire du post
      actorId: req.user.id,       // celui qui aime le post
      postId: post.id,
    });

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Failed to like post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.commentPost = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      content,
      userId: req.user.id,
      postId: post.id,
    });

    // Créer une notification
    await Notification.create({
      type: 'comment',
      userId: post.authorId,  // Propriétaire du post
      actorId: req.user.id,   // Celui qui commente
      postId: post.id,
      commentId: comment.id,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Failed to add comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.repostPost = async (req, res) => {
  const { id } = req.params;
  try {
    const originalPost = await Post.findByPk(id);
    if (!originalPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Créer un "nouveau" post qui a un champ originalPostId
    const repost = await Post.create({
      content: originalPost.content,
      media: originalPost.media,
      authorId: req.user.id,       // l'auteur du repost
      originalPostId: originalPost.id,
    });

    // Notification
    await Notification.create({
      type: 'repost',
      userId: originalPost.authorId, // l'auteur original du post
      actorId: req.user.id,          // celui qui a repost
      postId: originalPost.id,       // le post original
    });

    res.status(201).json(repost);
  } catch (error) {
    console.error('Failed to repost:', error);
    res.status(500).json({ error: 'Failed to repost' });
  }
};

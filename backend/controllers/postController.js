// controllers/postController.js

const Post = require('../models/post');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');
const { createNotification } = require('../services/notificationService');

exports.getAllPosts = async (req, res) => {
  try {
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
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};


exports.getUserPosts = async (req, res) => {
  const { address } = req.params;
  try {
    const posts = await Post.findAll({
      where: { '$author.address$': address, parentPostId: null }, // Ne récupérer que les posts racines
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
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
        {
          model: Post,
          as: 'responses',
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post with replies:', error);
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

    const likedBy = await post.getLikedBy();
    const isLikedBy = likedBy.some(user => user.id === req.user.id)

    if(isLikedBy) {
      await post.removeLikedBy(req.user);
      post.likes -= 1;
      await post.save();
      res.json({ message: 'Post unliked successfully', likes: post.likes, liked:false });
    } else {
      await post.addLikedBy(req.user);
      post.likes += 1;
      await post.save();
      await createNotification('like',post.authorId,req.user.id,post.id);
      res.json({ message: 'Post liked successfully', likes: post.likes, liked: true });
    }
  } catch (error) {
    console.error('Failed to like post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.commentPost = async (req, res) => {
  const { id } = req.params; // ID du post parent
  const { content } = req.body;
  const media = req.file ? req.file.filename : null;

  try {
    const parentPost = await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
        {
          model: Post,
          as: 'responses',
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!parentPost) {
      return res.status(404).json({ error: 'Parent post not found' });
    }

    const comment = await Post.create({
      content,
      media,
      authorId: req.user.id,
      parentPostId: parentPost.id,
    });

    await createNotification('comment',parentPost.authorId,req.user.id,parentPost.id,comment.id);

    res.status(201).json(parentPost);
  } catch (error) {
    console.error('Failed to add reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
};

exports.repostPost = async (req, res) => {
  const { id } = req.params;
  try {
    const originalPost = await Post.findByPk(id);
    if (!originalPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Vérifier si l'utilisateur a déjà reposté ce post
    const existingRepost = await Post.findOne({
      where: {
        originalPostId: originalPost.id,
        repostedById: req.user.id, // Vérifie si cet utilisateur a reposté
      },
    });

    if (existingRepost) {
      // Supprimer le repost existant
      await existingRepost.destroy();
      originalPost.reposts -= 1;
      await originalPost.save();

      return res.status(200).json({ isReposted: false, reposts: originalPost.reposts });
    }

    // Créer une référence au post original avec repostedById
    await Post.create({
      originalPostId: originalPost.id,
      repostedById: req.user.id, // Utilisateur qui a fait le repost
    });

    // Incrémenter le compteur de reposts sur le post original
    originalPost.reposts += 1;
    await originalPost.save();

    return res.status(201).json({ isReposted: true, reposts: originalPost.reposts });
  } catch (error) {
    console.error('Failed to repost:', error);
    res.status(500).json({ error: 'Failed to repost' });
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


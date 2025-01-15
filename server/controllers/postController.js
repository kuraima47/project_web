// controllers/postController.js

const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const Hashtag = require('../models/hashtag');

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
          as: 'Comments',
          include: [{
            model: User,
            attributes: ['id', 'username', 'avatar']
          }]
        },
        {
          model: Hashtag,
          as: 'Hashtags',
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

exports.getUserPosts = async (req, res) => {
  const { address } = req.params;  // L'adresse de l'utilisateur est récupérée à partir des paramètres de l'URL

  try {
    // On cherche les posts de l'utilisateur spécifié par son adresse
    const posts = await Post.findAll({
      where: {
        '$author.address$': address  // Filtrer les posts en fonction de l'adresse de l'utilisateur
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'address']
        },
        {
          model: Comment,
          as: 'Comments',
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'avatar']
            }
          ]
        },
        {
          model: Hashtag,
          as: 'Hashtags',
          attributes: ['name'],
          through: { attributes: [] }  // Ne pas inclure les attributs de la table de jointure
        }
      ],
      order: [['createdAt', 'DESC']]  // Trier par date de création du post (les plus récents en premier)
    });

    // Retourner les posts trouvés
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
};

exports.getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar', 'address'] },
        {
          model: Comment,
          as: 'Comments',
          include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
          order: [['createdAt', 'DESC']]
        },
        {
          model: Hashtag,
          as: 'Hashtags',
          attributes: ['name'],
          through: { attributes: [] }
        }
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

    await post.addLikedBy(req.user);
    post.likes += 1;
    await post.save();

    // Créer une notification
    await Notification.create({
      type: 'like',
      userId: post.authorId,
      actorId: req.user.id,
      postId: post.id,
    });

    res.json({ message: 'Post liked successfully', likes: post.likes });
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

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });

    // Créer une notification
    await Notification.create({
      type: 'comment',
      userId: post.authorId,
      actorId: req.user.id,
      postId: post.id,
      commentId: comment.id,
    });

    res.status(201).json(commentWithUser);
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

    const repost = await Post.create({
      content: originalPost.content,
      media: originalPost.media,
      authorId: req.user.id,
      originalPostId: originalPost.id,
    });

    originalPost.reposts += 1;
    await originalPost.save();

    // Notification
    await Notification.create({
      type: 'repost',
      userId: originalPost.authorId,
      actorId: req.user.id,
      postId: originalPost.id,
    });

    res.status(201).json({ repost, reposts: originalPost.reposts });
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


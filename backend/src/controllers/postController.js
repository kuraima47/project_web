// File: backend/src/controllers/postController.js
const { Post, User } = require('../models');

const { fetchAndFormatPosts, createAndFetchPost } = require('../services/postService');

exports.createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const newPost = await createAndFetchPost({ content, authorId: userId });
    res.status(201).json({ post: newPost });
  } catch (error) {
    next(error);
  }
};

exports.getRecentPosts = async (req, res, next) => {
  try {
    const formattedPosts = await fetchAndFormatPosts({
      order: [['createdAt', 'DESC']],
      limit: 30,
    });

    res.status(200).json({
      posts: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: User, as: 'likedBy', attributes: ['id', 'username'] },
        { model: User, as: 'retweetedBy', attributes: ['id', 'username'] },
        { 
          model: Post, 
          as: 'comments', 
          include: [
            { model: User, as: 'author', attributes: ['id', 'username'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        posts
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: User, as: 'likedBy', attributes: ['id', 'username'] },
        { model: User, as: 'retweetedBy', attributes: ['id', 'username'] },
        { 
          model: Post, 
          as: 'comments', 
          include: [
            { model: User, as: 'author', attributes: ['id', 'username'] }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    post.content = content;
    await post.save();

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await post.destroy();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.addLikedBy(userId);

    res.status(200).json({
      status: 'success',
      message: 'Post liked successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.removeLikedBy(userId);

    res.status(200).json({
      status: 'success',
      message: 'Post unliked successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.retweetPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.addRetweetedBy(userId);

    res.status(200).json({
      status: 'success',
      message: 'Post retweeted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.unretweetPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.removeRetweetedBy(userId);

    res.status(200).json({
      status: 'success',
      message: 'Post unretweeted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.commentOnPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    const parentPost = await Post.findByPk(id);

    if (!parentPost) {
      return res.status(404).json({ message: 'Parent post not found' });
    }

    const comment = await Post.create({
      content,
      authorId,
      parentId: id
    });

    res.status(201).json({
      status: 'success',
      data: {
        comment
      }
    });
  } catch (error) {
    next(error);
  }
};
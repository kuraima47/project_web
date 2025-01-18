// controllers/postController.js

const Post = require('../models/post');
const User = require('../models/user');
const Interest = require('../models/interest');
const UserInterest = require('../models/userInterest');
const Repost = require('../models/repost');
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
  const userId = req.user.id; // Utilisateur actuel qui effectue la demande

  try {

    
    const userToCheck = await User.findOne({where: { address: address }})

    if(!userToCheck)
      res.status(404).json({ error: 'Utilisateur introuvable avec ladresse spécifiée' });
    // Étape 1 : Récupérer les posts originaux de l'utilisateur spécifié
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


    // Étape 2 : Récupérer les reposts faits par l'utilisateur
    const reposts = await Post.findAll({
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
        {
          model: User,
          as: 'repostedBy',
          through: { attributes: ['createdAt'] }, // Récupère la date de repost depuis la table Repost
          attributes: ['id', 'username', 'avatar'],
        },
      ],
      where: { '$repostedBy.id$': userToCheck.id }, // Récupérer les posts où l'utilisateur actuel a reposté
    });

    // Ajouter la date de repost (createdAt) dans les reposts
    reposts.forEach((repost) => {
      repost.repostDate = repost.repostedBy[0].Repost.createdAt; // Accède à la date de repost
    });

    // Étape 3 : Combiner les posts originaux et les reposts
    // On peut concaténer les deux tableaux de posts et trier par la date de création ou de repost.
    const combinedPosts = [...posts, ...reposts].sort((a, b) => {
      const aDate = a.repostDate || a.createdAt; // Utilise la date du repost si présente, sinon la date de création du post
      const bDate = b.repostDate || b.createdAt;
      return new Date(bDate) - new Date(aDate); // Trie du plus récent au plus ancien
    });

    res.json(combinedPosts);
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

      const hashtags = await post.getHashtags();  // => ex: [ { name: 'blockchain' }, ... ]

      // 4) Pour chaque hashtag, faire un findOrCreate dans Interests,
      //    puis incrémenter le score de l'utilisateur dans UserInterest
      for (const hashtag of hashtags) {
        const interestName = hashtag.name.toLowerCase();
        const [interest] = await Interest.findOrCreate({
          where: { name: interestName },
          defaults: { name: interestName }
        });
  
        // Vérifier si on a déjà une entrée (userId, interestId)
        let userInterest = await UserInterest.findOne({
          where: {
            userId: req.user.id,
            interestId: interest.id
          }
        });
  
        if (!userInterest) {
          // Pas encore d'entrée -> on crée avec un score de base
          userInterest = await UserInterest.create({
            userId: req.user.id,
            interestId: interest.id,
            score: 1 // Première interaction
          });
        } else {
          // On incrémente le score existant
          userInterest.score += 1;
          await userInterest.save();
        }
      }

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


exports.getPostInfos =  async (req, res) => {
  const { id } = req.params;
  try {
    const isReposted = await Repost.findOne({
      where: {
        postId: id,
        userId: req.user.id, 
      },
    });

    const existingLike = await Post.findByPk(id);
    const likedBy = await existingLike.getLikedBy();
    const isLiked = likedBy.some(user => user.id === req.user.id)

    return res.status(201).json({isLiked:isLiked, isReposted:isReposted});
  } catch (error) {
    console.error('Failed to repost:', error);
    res.status(500).json({ error: 'Failed to repost' });
  }
}

exports.repostPost = async (req, res) => {
  const { id } = req.params;
  try {
    const originalPost = await Post.findByPk(id);
    if (!originalPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Vérifier si l'utilisateur a déjà reposté ce post
    const existingRepost = await Repost.findOne({
      where: {
        postId: originalPost.id,
        userId: req.user.id, // Vérifie si cet utilisateur a reposté
      },
    });

    if (existingRepost) {
      // Si le repost existe déjà, supprimer l'entrée de la table "Repost"
      await existingRepost.destroy();

      // Décrémenter le nombre de reposts du post original
      originalPost.reposts -= 1;
      await originalPost.save();
      return res.status(200).json({ isReposted: false, reposts: originalPost.reposts });
    }

    // Créer la relation dans la table "Repost"
    await Repost.create({
      postId: originalPost.id,
      userId: req.user.id, // Utilisateur qui a reposté
    });

    await createNotification('repost',originalPost.authorId,req.user.id,originalPost.id);

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


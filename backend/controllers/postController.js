// controllers/postController.js

const {Post,User,Interest,UserInterest,Repost,Hashtag}  = require('../models');

const { createNotification } = require('../services/notificationService');

/**
 * Récupère les posts des abonnements de l'utilisateur connecté.
 * Les posts sont triés par date de création.
 *
 * @param {Object} req - Requête HTTP (l'utilisateur connecté doit être dans req.user).
 * @param {Object} res - Réponse HTTP contenant les posts triés.
 * @returns {Object} - Réponse JSON avec tous les posts des utilisateurs suivis.
 */
exports.getAllFollowingPosts = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur connecté
    const userId = req.user.id;

    // Vérifier que l'utilisateur est authentifié
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Étape 1 : Récupérer les utilisateurs suivis
    const following = await User.findAll({
      include: [
        {
          model: User,
          as: 'following', // Alias défini dans la relation
          attributes: ['id'], // Récupérer uniquement les IDs
          through: { attributes: [] }, // Supprimer les métadonnées inutiles
        },
      ],
      where: { id: userId },
    });

    if (!following.length || !following[0].following.length) {
      return res.json([]); // Aucun abonnement
    }

    // Extraire les IDs des utilisateurs suivis
    const followingIds = following[0].following.map((user) => user.id);

    // Étape 2 : Récupérer les posts des utilisateurs suivis
    const posts = await Post.findAll({
      where: {
        authorId: followingIds, // Posts des utilisateurs suivis
        parentPostId: null, // Récupérer uniquement les posts racines
      },
      include: [
        {
          model: User,
          as: 'author', // Inclure l'auteur des posts
          attributes: ['id', 'username', 'avatar', 'address'],
        },
        {
          model: Post,
          as: 'responses', // Inclure les réponses
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'avatar'] }],
        },
        {
          model: Hashtag,
          as: 'Hashtags', // Inclure les hashtags associés
          attributes: ['name'],
          through: { attributes: [] },
        },
      ],
      order: [['createdAt', 'DESC']], // Trier par date de création
    });

    // Étape 3 : Retourner les posts triés
    return res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
},

/**
 * Affiche le contenu d'un document Markdown associé à une release spécifique d'un projet.
 *
 * Cette fonction extrait le nom du document depuis les paramètres de la requête.
 * Elle vérifie si l'utilisateur est connecté, puis récupère la release correspondante.
 * Elle s'assure que le document demandé appartient bien à la release.
 * Ensuite, elle construit le chemin du fichier en fonction de l'environnement (test ou production).
 * Si le fichier existe, son contenu Markdown est converti en HTML et rendu dans la vue 'markdown'. Sinon, une erreur est renvoyée.
 *
 * @async
 * @function viewDocument
 * @param {Object} req - L'objet requête Express contenant  `photoName` dans les paramètres.
 * @param {Object} res - L'objet réponse Express.
 * @returns {Promise<void>} Aucune valeur retournée directement. La réponse est rendue via `res.render` ou `res.status`.
 */
exports.viewImage = async (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    const photoName = req.params.photoName;
    const filePath = path.join(__dirname, '../uploads', photoName);

    // Vérification si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Envoi du fichier
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erreur lors de la visualisation du fichier:', error);
    res.status(500).json({ error: 'Erreur lors de la visualisation du fichier' });
  }
};



/**
 * Récupère tous les posts racines (sans parent) triés par date de création.
 * Inclut l'auteur, les réponses, et les hashtags associés.
 * 
 * @param {Object} req - Requête HTTP (aucune donnée nécessaire).
 * @param {Object} res - Réponse HTTP contenant la liste des posts.
 * @returns {Object} - Réponse JSON avec tous les posts.
 */
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

    return res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * Récupère les posts de l'utilisateur spécifié par son adresse.
 * Inclut les posts originaux ainsi que les reposts.
 * 
 * @param {Object} req - Requête HTTP contenant l'adresse de l'utilisateur dans les paramètres.
 * @param {Object} res - Réponse HTTP contenant la liste des posts de l'utilisateur.
 * @returns {Object} - Réponse JSON avec tous les posts de l'utilisateur, originaux et repostés.
 */
exports.getUserPosts = async (req, res) => {
  const { address } = req.params;
  const userId = req.user.id;

  try {
    const userToCheck = await User.findOne({ where: { address } });

    if (!userToCheck)
      return res.status(404).json({ error: 'Utilisateur introuvable avec l\'adresse spécifiée' });

    // Récupérer les posts originaux de l'utilisateur
    const posts = await Post.findAll({
      where: { '$author.address$': address, parentPostId: null },
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

    // Récupérer les reposts de l'utilisateur
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
          through: { attributes: ['createdAt'] },
          attributes: ['id', 'username', 'avatar'],
        },
      ],
      where: { '$repostedBy.id$': userToCheck.id },
    });

    reposts.forEach((repost) => {
      repost.repostDate = repost.repostedBy[0].Repost.createdAt;
    });

    // Combiner les posts originaux et les reposts et les trier
    const combinedPosts = [...posts, ...reposts].sort((a, b) => {
      const aDate = a.repostDate || a.createdAt;
      const bDate = b.repostDate || b.createdAt;
      return new Date(bDate) - new Date(aDate);
    });

    return res.json(combinedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * Récupère un post par son ID, avec ses réponses (s'il y en a).
 * 
 * @param {Object} req - Requête HTTP contenant l'ID du post dans les paramètres.
 * @param {Object} res - Réponse HTTP contenant le post et ses réponses.
 * @returns {Object} - Réponse JSON avec le post et ses réponses.
 */
exports.getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: Post,
          as: 'responses',
          include: [
            {
              model: User,
              as: 'author'
            },
            {
              model: Post,
              as: 'responses',
              include: [
                {
                  model: User,
                  as: 'author'
                },
              ],
            }
          ],
        },
      ],
      // Pour trier *uniquement* les "responses" en DESC :
      order: [
        [{ model: Post, as: "responses" }, "createdAt", "DESC"]
      ],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    console.error("Error fetching post with replies:", error);
    return res.status(500).json({ error: "Failed to fetch post" });
  }
};

/**
 * Permet à un utilisateur de liker un post. Si l'utilisateur a déjà liké, cela le retire.
 * 
 * @param {Object} req - Requête HTTP contenant l'ID du post à liker dans les paramètres.
 * @param {Object} res - Réponse HTTP contenant l'état du like du post.
 * @returns {Object} - Réponse JSON avec le message de succès et le nombre de likes mis à jour.
 */
exports.likePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likedBy = await post.getLikedBy();
    const isLikedBy = likedBy.some(user => user.id === req.user.id);

    if (isLikedBy) {
      await post.removeLikedBy(req.user);
      post.likes -= 1;
      await post.save();
      return res.json({ message: 'Post unliked successfully', likes: post.likes, liked: false });
    } else {
      await post.addLikedBy(req.user);
      post.likes += 1;
      await post.save();
      await createNotification('like', post.authorId, req.user.id, post.id);

      const hashtags = await post.getHashtags();
      for (const hashtag of hashtags) {
        const interestName = hashtag.name.toLowerCase();
        const [interest] = await Interest.findOrCreate({
          where: { name: interestName },
          defaults: { name: interestName }
        });

        let userInterest = await UserInterest.findOne({
          where: { userId: req.user.id, interestId: interest.id }
        });

        if (!userInterest) {
          userInterest = await UserInterest.create({
            userId: req.user.id,
            interestId: interest.id,
            score: 1
          });
        } else {
          userInterest.score += 1;
          await userInterest.save();
        }
      }

      return res.json({ message: 'Post liked successfully', likes: post.likes, liked: true });
    }
  } catch (error) {
    console.error('Failed to like post:', error);
    return res.status(500).json({ error: 'Failed to like post' });
  }
};

/**
 * Permet à un utilisateur de commenter un post. Le commentaire peut contenir du texte et un média.
 * 
 * @param {Object} req - Requête HTTP contenant l'ID du post à commenter dans les paramètres et le contenu du commentaire dans le corps.
 * @param {Object} res - Réponse HTTP contenant le post original après le commentaire.
 * @returns {Object} - Réponse JSON avec le post original après l'ajout du commentaire.
 */
exports.commentPost = async (req, res) => {
  const { id } = req.params;
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

    await createNotification('comment', parentPost.authorId, req.user.id, parentPost.id, comment.id);

    return res.status(201).json(parentPost);
  } catch (error) {
    console.error('Failed to add reply:', error);
    return res.status(500).json({ error: 'Failed to add reply' });
  }
};

/**
 * Récupère les informations sur un post, notamment si l'utilisateur l'a liké ou reposté.
 * 
 * @param {Object} req - Requête HTTP contenant l'ID du post dans les paramètres.
 * @param {Object} res - Réponse HTTP contenant les informations sur le post.
 * @returns {Object} - Réponse JSON avec les informations sur le like et le repost.
 */
exports.getPostInfos = async (req, res) => {
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
    const isLiked = likedBy.some(user => user.id === req.user.id);

    return res.status(201).json({ isLiked, isReposted });
  } catch (error) {
    console.error('Failed to repost:', error);
    return res.status(500).json({ error: 'Failed to repost' });
  }
};

/**
 * Permet à un utilisateur de reposté un post existant.
 * 
 * @param {Object} req - Requête HTTP contenant l'ID du post à reposté dans les paramètres.
 * @param {Object} res - Réponse HTTP contenant le post reposté.
 * @returns {Object} - Réponse JSON avec le message de succès et les informations sur le repost.
 */
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
    return res.status(500).json({ error: 'Failed to repost' });
  }
};

/**
 * Permet de créer un nouveau post.
 * Le post peut contenir du texte, un média, et des hashtags. 
 * Les hashtags sont ajoutés ou créés dans la base de données si nécessaire.
 * 
 * @param {Object} req - Requête HTTP contenant les informations du post dans le corps.
 * @param {Object} res - Réponse HTTP contenant le post créé.
 * @returns {Object} - Réponse JSON avec le message de succès et le post créé.
 */
exports.createPost = async (req, res) => {
  const { content, hashtags, parentPostId } = req.body;
  const media = req.file ? req.file.filename : null;

  try {
    // Créer le nouveau post
    const newPost = await Post.create({
      content,
      media,
      authorId: req.user.id,
      parentPostId: parentPostId || null, // Si le post est une réponse, on utilise parentPostId
    });

    // Ajouter les hashtags au post
    if (hashtags && hashtags.length > 0) {
      for (const hashtagName of hashtags) {
        const hashtag = await Hashtag.findOrCreate({
          where: { name: hashtagName.toLowerCase() }, // Trouver ou créer le hashtag
        });

        // Associer le hashtag au post
        await newPost.addHashtag(hashtag[0]);
      }
    }

    // Retourner une réponse JSON avec le post créé
    return res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    console.error('Failed to create post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};


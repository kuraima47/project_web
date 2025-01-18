// controllers/userController.js

const { ethers } = require('ethers');
const User = require('../models/user');
const Notification = require('../models/notification');
const Interest = require('../models/Interest');
const UserInterest = require('../models/UserInterest')
const UserFollows = require('../models/userFollow');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../services/notificationService');

exports.authenticate = async (req, res) => {
  const { address, signature, message } = req.body;

  try {
    // Vérifier la signature
    const signerAddr = ethers.utils.verifyMessage(message, signature);
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // On recherche l’utilisateur par adresse
    let user = await User.findOne({
      where: { address: address.toLowerCase() }
    });

    // Si pas trouvé, on le crée
    if (!user) {
      user = await User.create({ address: address.toLowerCase() });
    }

    // Générer un token JWT
    const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';
    const token = jwt.sign(
        { id: user.id },
        secretKey,
        { expiresIn: '1d' }
    );

    // Renvoyer user + token
    return res.json({ user, token });
  } catch (error) {
    console.error('Error in authenticate:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

exports.register = async (req, res) => {
  const { address, username, avatar, bio } = req.body;
  try {
    const user = await User.findOne({ where: { address: address.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = username;
    user.avatar = avatar;
    user.bio = bio;
    await user.save();

    return res.json({ user });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};


exports.getFromToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  // Extraire le token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token not found' });
  }
  // Vérification du token
  const secretKey = process.env.JWT_SECRET || 'jwt_secret_key';
  const decoded = jwt.verify(token, secretKey);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: 'Invalid token payload' });
  }
  const user = await User.findByPk(decoded.id);
  res.status(200).json(user);
}

exports.getProfile = async (req, res) => {
  const { address } = req.params;
  try {
    const user = await User.findOne({
      where: { address: address.toLowerCase() },
      include: [{
        model: Interest,
        as: 'interests',
        // On veut aussi le score dans la table pivot => "UserInterest"
        through: {
          attributes: ['score']
        }
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // user.interests[i].UserInterest.score => accès au champ score dans la jonction
    return res.json(user);
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};


exports.updateProfile = async (req, res) => {
  const { username, avatar, bio } = req.body;
  const userId = req.user.id; // Récupéré depuis le token décodé

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Vérifier si on n’entre pas un username déjà pris (uniquement si modifié)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    user.username = username || user.username;
    user.avatar = avatar || user.avatar;
    user.bio = bio || user.bio;
    await user.save();

    return res.json({ user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};
/**
 * @route POST /api/users/:id/follow
 * L'utilisateur connecté (req.user) suit l'utilisateur :id
 */
exports.followUser = async (req, res) => {
  try {
    const addressToFollow = req.params.address;

    if (addressToFollow === req.user.address) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findOne({
      where: { address: addressToFollow },
    });
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1) Effectuer le follow
    await req.user.addFollowing(userToFollow);
    await createNotification('follow', userToFollow.id, req.user.id);

    // 2) Extraire un "thème" ou "hashtag" de la bio, par exemple
    const userBio = userToFollow.bio || '';
    const bioHashtags = userBio.match(/#\w+/g) || [];

    // 3) Incrémenter le score
    for (let tag of bioHashtags) {
      tag = tag.slice(1).toLowerCase();  // remove '#'

      const [interest] = await Interest.findOrCreate({
        where: { name: tag },
        defaults: { name: tag }
      });

      let userInterest = await UserInterest.findOne({
        where: {
          userId: req.user.id,
          interestId: interest.id
        }
      });

      if (!userInterest) {
        await UserInterest.create({
          userId: req.user.id,
          interestId: interest.id,
          score: 1 // ou 2, si tu veux que follow "pèse" plus qu'un like
        });
      } else {
        userInterest.score += 1; // ou += 2
        await userInterest.save();
      }
    }

    return res.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route DELETE /api/users/:id/unfollow
 * L'utilisateur connecté arrête de suivre l'utilisateur :id
 */
exports.unfollowUser = async (req, res) => {
  try {
    const addressToUnfollow = req.params.address;


    if (addressToUnfollow === req.user.address) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    // Vérifier que l'utilisateur existe
    const userToUnfollow = await User.findOne({
      where: { address: addressToUnfollow },
    });;
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retirer la relation
    await req.user.removeFollowing(userToUnfollow);

    await createNotification('unfollow',userToUnfollow.id,req.user.id);

    return res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route GET /api/users/:id/followers
 * Récupère la liste des followers de l'utilisateur :id
 */
exports.getFollowers = async (req, res) => {
  try {
    const userAddress = req.params.address;

    const user = await User.findOne({
      where: { address: userAddress },
    });;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Récupérer tous les followers
    // "followers" => as défini dans le modèle
    const followers = await user.getFollowers();

    return res.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route GET /api/users/:address/following
 * Récupère la liste des utilisateurs suivis par l'utilisateur :adress
 */
exports.getFollowing = async (req, res) => {
  try {
    const userAddress = req.params.address;
    const user = await User.findOne({
      where: { address: userAddress },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Récupérer les relations de suivi dans UserFollows
    const followingRelations = await UserFollows.findAll({
        where: { followerId: user.id },
        attributes: ['followingId'],
    });

    // Extraire les IDs et rechercher les utilisateurs correspondants
    const followingIds = followingRelations.map(relation => relation.followingId);
    const followingUsers = await User.findAll({
        where: { id: followingIds },
    });

    return res.json(followingUsers);
  } catch (error) {
    console.error('Error fetching following:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.doFollow = async (req, res) => {
  try {
    const launcherUser = req.user;
    const followerToFind = req.params.address;   // Adresse de l'utilisateur à vérifier

    if (!launcherUser) {
      return res.status(404).json({ error: 'Launcher user not found' });
    }

    const following = await launcherUser.getFollowing();

    // Vérifier si le followerToFind est dans la liste des utilisateurs suivis
    const isFollowing = following.some(user => user.address === followerToFind);

    return res.json({ isFollowing });
  } catch (error) {
    console.error('Error fetching following:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } 
};
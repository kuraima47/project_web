// controllers/userController.js

const { ethers } = require('ethers');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

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
    const secretKey = process.env.JWT_SECRET || 'MySecretKey';
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

exports.getProfile = async (req, res) => {
  const { address } = req.params;
  try {
    const user = await User.findOne({
      where: { address: address.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    // ID de l'utilisateur qu'on veut suivre
    const userIdToFollow = parseInt(req.params.id, 10);

    // Vérification si c’est pas soi-même
    if (userIdToFollow === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Vérifier que l'utilisateur à suivre existe
    const userToFollow = await User.findByPk(userIdToFollow);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ajouter la relation
    await req.user.addFollowing(userToFollow);

    // Créer une notification (optionnel)
    await Notification.create({
      type: 'follow',
      userId: userToFollow.id,   // la personne qui est suivie
      actorId: req.user.id,      // celui qui suit
    });

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
    const userIdToUnfollow = parseInt(req.params.id, 10);

    if (userIdToUnfollow === req.user.id) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    // Vérifier que l'utilisateur existe
    const userToUnfollow = await User.findByPk(userIdToUnfollow);
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retirer la relation
    await req.user.removeFollowing(userToUnfollow);

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
    const userId = parseInt(req.params.id, 10);

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
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
 * @route GET /api/users/:id/following
 * Récupère la liste des utilisateurs suivis par l'utilisateur :id
 */
exports.getFollowing = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Récupérer ceux qu'il suit
    // "following" => as défini dans le modèle
    const following = await user.getFollowing();

    return res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
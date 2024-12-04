const { User } = require('../models');
const { compressImageToBase64 } = require('../utils/imageUtils');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'displayName', 'profilePicture', 'email', 'bio'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, username, bio } = req.body;
    const profilePicture = req.file; // Fichier envoyé pour l'image

    if (displayName && displayName.length > 20) {
      return res.status(400).json({ message: 'Le nom doit faire 20 caractère au maximum' });
    }
    if (username && username.length > 20) {
      return res.status(400).json({ message: 'Le nom doit faire 20 caractère au maximum' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
      }
    }

    user.displayName = displayName || user.displayName;
    user.username = username || user.username;
    user.bio = bio || user.bio;

    if (profilePicture) {
      const imageBase64 = await compressImageToBase64(profilePicture.buffer);
      user.profilePicture = imageBase64;
    }

    await user.save();

    res.status(200).json({ message: 'Profil mis à jour avec succès', user });
  } catch (error) {
    next(error);
  }
};
const { User } = require('../models');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { ...req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.followers.push(req.user.id);
    await user.save();
    res.status(200).json({ message: 'Followed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.followers = user.followers.filter((id) => id !== req.user.id);
    await user.save();
    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

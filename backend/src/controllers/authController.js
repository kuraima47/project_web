// File: backend/src/controllers/authController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signToken = (id) => {
  console.log(process.env.JWT_SECRET_TW);
  return jwt.sign({ id }, process.env.JWT_SECRET_TW, {
    expiresIn: '1d'
  });
};

exports.logout = (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'User logged out successfully!',
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  console.log("register");
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

    const token = signToken(newUser.id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Merci de donner un mail et un mot de passe' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Mail ou mot de passe invalide' });
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (error) {
    next(error);
  }
};
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { seedDefaultCategoriesForUser } = require('../utils/defaultCategories');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'spendwise_super_secure_jwt_secret_key_2026_dev_prod';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, create default categories & return JWT
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', [], 409);
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Provision default categories for the new user
    await seedDefaultCategoriesForUser(user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    return successResponse(
      res,
      'Account created successfully',
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return token
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', [], 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', [], 401);
    }

    const token = generateToken(user._id);

    return successResponse(
      res,
      'Login successful',
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      },
      200
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 */
exports.getMe = async (req, res, next) => {
  try {
    return successResponse(
      res,
      'User profile retrieved successfully',
      {
        user: req.user
      },
      200
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client clears token)
 */
exports.logout = async (req, res, next) => {
  try {
    return successResponse(res, 'Logged out successfully', null, 200);
  } catch (err) {
    next(err);
  }
};

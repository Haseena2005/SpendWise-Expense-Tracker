const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/profile
 * Get authenticated user profile & preferences
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return successResponse(res, 'Profile retrieved successfully', user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile
 * Update user profile details & preferences
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, currency, dateFormat, notificationPreferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (currency && ['INR', 'USD', 'EUR', 'GBP', 'JPY'].includes(currency.toUpperCase())) {
      user.currency = currency.toUpperCase();
    }
    if (dateFormat) user.dateFormat = dateFormat;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    await user.save();
    return successResponse(res, 'Profile updated successfully', user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile/currency
 * Quick update currency preference
 */
exports.updateCurrency = async (req, res, next) => {
  try {
    const { currency } = req.body;
    if (!currency || !['INR', 'USD', 'EUR', 'GBP', 'JPY'].includes(currency.toUpperCase())) {
      return errorResponse(res, 'Invalid currency code. Allowed: INR, USD, EUR, GBP, JPY', [], 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { currency: currency.toUpperCase() },
      { new: true }
    ).select('-password');

    return successResponse(res, `Currency preference updated to ${user.currency}`, user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/profile/photo
 * Upload profile photo
 */
exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No photo file provided', [], 400);
    }

    const user = await User.findById(req.user._id);

    // Remove old photo if exists
    if (user.profilePhoto && user.profilePhoto.startsWith('/uploads/profiles/')) {
      const oldPath = path.join(__dirname, '../../', user.profilePhoto);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    const relativeUrl = `/uploads/profiles/${req.file.filename}`;
    user.profilePhoto = relativeUrl;
    await user.save();

    return successResponse(res, 'Profile photo updated successfully', { profilePhoto: relativeUrl, user });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/profile/photo
 * Remove profile photo
 */
exports.removePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.profilePhoto && user.profilePhoto.startsWith('/uploads/profiles/')) {
      const oldPath = path.join(__dirname, '../../', user.profilePhoto);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    user.profilePhoto = '';
    await user.save();

    return successResponse(res, 'Profile photo removed successfully', { profilePhoto: '', user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/profile/password
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide both current and new password', [], 400);
    }
    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', [], 400);
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password', [], 400);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 'Password changed successfully', null);
  } catch (err) {
    next(err);
  }
};

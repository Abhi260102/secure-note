const User = require('../models/user.model');
const crypto = require('crypto');
const tokenHelper = require('../helpers/token.helper');

const registerUser = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (!user) {
    const error = new Error('Invalid user data');
    error.statusCode = 400;
    throw error;
  }

  const accessToken = tokenHelper.generateAccessToken(user._id);
  const refreshToken = tokenHelper.generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = tokenHelper.generateAccessToken(user._id);
  const refreshToken = tokenHelper.generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = tokenHelper.verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    error.code = 'REFRESH_TOKEN_EXPIRED';
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error('Refresh token not recognized');
    error.statusCode = 401;
    error.code = 'REFRESH_TOKEN_INVALID';
    throw error;
  }

  const newAccessToken = tokenHelper.generateAccessToken(user._id);
  const newRefreshToken = tokenHelper.generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const forgotPassword = async (email, originHeader, clientUrlEnv) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No account associated with this email address.');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const frontendOrigin = originHeader || clientUrlEnv;
  const resetUrl = `${frontendOrigin}/auth/reset-password/${resetToken}`;

  console.log('\n=========================================');
  console.log('PASSWORD RESET REQUEST RECEIVED');
  console.log(`User: ${user.name} (${user.email})`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('=========================================\n');

  return {
    resetToken,
    resetUrl,
  };
};

const resetPassword = async (token, password) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired password reset token.');
    error.statusCode = 400;
    throw error;
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshToken = null;

  await user.save();
  return true;
};

const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logoutUser,
};

const { body, validationResult } = require('express-validator');
const CryptoJS = require('crypto-js');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateNote = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Note title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('content')
    .notEmpty()
    .withMessage('Note content is required')
    .custom((value) => {
      try {
        const secret = process.env.AES_SECRET || 'supersecretkeyshouldbechangeinproduction123';
        const bytes = CryptoJS.AES.decrypt(value, secret);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText) {
          throw new Error('Invalid encrypted note content');
        }
        return true;
      } catch (err) {
        throw new Error('Invalid encrypted note content');
      }
    }),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateNote,
};

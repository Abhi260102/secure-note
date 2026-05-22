const { sendError } = require('../helpers/response.helper');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Email already registered';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  const appErrorCode = typeof err.code === 'string' ? err.code : null;

  return sendError(res, statusCode, message, appErrorCode, err.stack);
};

module.exports = { errorHandler };

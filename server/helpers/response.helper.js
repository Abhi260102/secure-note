const sendSuccess = (res, statusCode, message, data = null) => {
  const responsePayload = {
    success: true,
  };
  if (message) {
    responsePayload.message = message;
  }
  if (data !== null) {
    responsePayload.data = data;
  }
  return res.status(statusCode).json(responsePayload);
};

const sendError = (res, statusCode, message, code = null, stack = null) => {
  const responsePayload = {
    success: false,
    message,
  };
  if (code) {
    responsePayload.code = code;
  }
  if (stack && process.env.NODE_ENV !== 'production') {
    responsePayload.stack = stack;
  }
  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  sendSuccess,
  sendError,
};

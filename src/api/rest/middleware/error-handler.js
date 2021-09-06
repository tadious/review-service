const log = require('loglevel');
const ResponseError = require('./ResponseError');
const DetailedResponseError = require('./DetailedResponseError');

const errorMessages = {
  404: 'Not Found',
  401: 'Unauthorized',
  403: 'Forbidden',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const errorResponse = {
    timestamp: Math.round(Date.now() / 1000),
  };
  if (err instanceof ResponseError) {
    errorResponse.statusCode = err.statusCode || 500;
    errorResponse.message = err.message || errorMessages[errorResponse.statusCode];
  } else if (err instanceof DetailedResponseError) {
    errorResponse.statusCode = err.statusCode || 500;
    errorResponse.message = err.message || errorMessages[errorResponse.statusCode];
    errorResponse.details = err.details || [];
  } else {
    errorResponse.statusCode = 500;
    errorResponse.message = errorMessages['500'];
    log.error('unhandled error', { url: req.url, errorResponse, err });
  }

  log.debug('unhandled error', { url: req.url, errorResponse, err });
  return res.status(errorResponse.statusCode).json(errorResponse);
};

errorHandler.ResponseError = ResponseError;

module.exports = errorHandler;

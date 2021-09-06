const log = require('loglevel');

const requestLoggerFactory = () => {
  const requestLogger = (req, res, next) => {
    log.info('request-middleware: Received request', {
      url: req.url,
      method: req.method,
      body: req.body,
    });
    next();
  };
  return requestLogger;
};

module.exports = requestLoggerFactory;

const log = require('loglevel');

const requestValidator = (key, schema, options) => (req, res, next) => {
  const validationOptions = {
    ...options,
  };

  if (validationOptions.context) {
    validationOptions.context.data = req[key];
  } else {
    validationOptions.context = { data: req[key] };
  }

  const result = schema.validate(req[key], validationOptions);
  if (result.error) {
    log.error('Validation error', { error: result.error });

    const {
      details,
      name,
      message,
      stack,
    } = result.error;

    res.status(400).json({
      details,
      name,
      message,
      stack,
    });
  } else {
    next();
  }
};

module.exports = requestValidator;

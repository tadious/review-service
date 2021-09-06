const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  brand: joi.string(),
  description: joi.string().required(),
  tags: joi.string(),
  rating: joi.number().required(),
});

const joi = require('@hapi/joi');

const { enums } = require('../../db-handlers/models/ReviewMedia');

module.exports = joi.object().keys({
  item: joi.string().required(),
  brand: joi.string(),
  description: joi.string().required(),
  tags: joi.string(),
  rating: joi.number().required(),
  file: joi.string().allow(null),
  type: joi.string().valid(...Object.keys(enums.TYPES)).allow(null),
});

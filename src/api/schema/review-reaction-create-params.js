const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  reviewId: joi.number().required(),
});

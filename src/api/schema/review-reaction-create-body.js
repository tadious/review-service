const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  type: joi.string().required(),
});

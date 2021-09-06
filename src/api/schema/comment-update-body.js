const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  text: joi.string().required(),
});

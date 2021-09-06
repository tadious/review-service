const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  id: joi.number().required(),
});

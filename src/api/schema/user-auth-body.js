const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  email: joi.string().email().required(),
  password: joi.string().required(), 
});

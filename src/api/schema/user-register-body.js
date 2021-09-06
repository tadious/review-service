const joi = require('@hapi/joi');

const { enums } = require('../../db-handlers/models/UserRole');

module.exports = joi.object().keys({
  userData: joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required(),  
  }).required(),
  roles: joi.array().items(
    joi.any().valid(...Object.keys(enums.ROLES)),
  ).required(),
});

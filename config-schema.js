const joi = require('@hapi/joi');

module.exports = joi.object().keys({
  knex: joi.object().keys({
    client: joi.string().required(),
    connection: joi.object().required().keys({
      database: joi.string().required(),
      user: joi.string().required(),
      password: joi.string().allow('').required(),
      host: joi.string().required(),
      port: joi.number().port(),
    }),
    migrations: joi.object().required().keys({
      directory: joi.string().required(),
      tableName: joi.string(),
    }),
  }).required(),
  webServer: joi.object().keys({
    port: joi.number().port().required(),
  }).required(),
  smsPortal: joi.object().keys({
    url: joi.string().required(),
    authToken: joi.string().required(),
  }).required(),
  webToken: joi.object().keys({
    secret: joi.string().required(),
    expiresIn: joi.number().required(),
  }).required(),
  sirv: joi.object().keys({
    hostname: joi.string().required(),
    clientId: joi.string().required(),
    secret: joi.string().required(),
  }).required(),
});

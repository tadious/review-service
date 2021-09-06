const joi = require('@hapi/joi');
const phoneValidator = joi.extend(require('joi-phone-number'));

module.exports = joi.object().keys({
  name: joi.string().allow('', null),
  username: joi.string().allow('', null),
  bio: joi.string().allow('', null),
  mobileNumber: phoneValidator
    .string()
    .phoneNumber({ defaultCountry: 'ZA', format: 'international' })
    .allow('', null),
  birthday: joi.string().allow('', null),
  avatar: joi.string().allow('', null),
  avatarBackground: joi.string().allow('', null),
});

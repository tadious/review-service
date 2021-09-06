const joi = require('@hapi/joi');
const phoneValidator = joi.extend(require('joi-phone-number'));

module.exports = joi.object().keys({
  mobilePhone: phoneValidator
    .string()
    .phoneNumber({ defaultCountry: 'ZA', format: 'international' })
    .required(),
});

const log = require('loglevel');

const SmsPortalClient = require('../../service-clients/SmsPortalClient');

const sendSms = (user, type) => {
  log.info('Sending sms', { mobilePhone: user.mobilePhone, type });
};

module.exports = {
  sendSms,
};

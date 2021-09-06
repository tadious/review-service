const axios = require('axios');

let smsPortalClient;

module.exports = class SmsPortalClient {
  static init(config) {
    smsPortalClient = new SmsPortalClient(config);
  }

  static instance() {
    if (!smsPortalClient) {
      throw new Error('SmsPortalClient not initialized');
    }
    return smsPortalClient;
  }

  constructor(config) {
    this.config = config;
  }

  async sendSms(request) {
    const smsRequest = {
      'messages': [ {'content': request.message, 'destination': `${request.mobilePhone}`} ],
    };
    
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.authToken}`,
      },
    };
    
    const response = await axios.post(this.config.url, smsRequest, options);
    return response;
  }
};

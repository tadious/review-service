const axios = require('axios');
const http = require("https");

let sirvClient;

module.exports = class SirvClient {
  static init(config) {
    sirvClient = new SirvClient(config);
  }

  static instance() {
    if (!sirvClient) {
      throw new Error('SirvClient not initialized');
    }
    return sirvClient;
  }

  constructor(config) {
    this.config = config;
  }

  async getAuthToken() {
    const response = await axios.post(
      `https://${this.config.hostname}/v2/token`,
      {
        clientId: this.config.clientId,
        clientSecret: this.config.secret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async uploadFile(pathToFile, base64ImageData) {
    const auth = await this.getAuthToken();
    const buffer = new Buffer.from(base64ImageData, 'base64');
    const options = {
      'method': 'POST',
      'hostname': this.config.hostname,
      'port': null,
      'path': `/v2/files/upload?filename=${this.config.imagePath}${pathToFile}`,
      'headers': {
        'content-type': 'application/json',
        'authorization': `Bearer ${auth.token}`
      },
    };

    const req = http.request(options, function (res) {
      const chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        var body = Buffer.concat(chunks);
      });
    });

    req.write(buffer);
    req.end();

    return `${this.config.imageRoot}${this.config.imagePath}${pathToFile}`;
  }
};

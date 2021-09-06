const jwt = require('jsonwebtoken');
const moment = require('moment');

// JWT header for algorith HS256, this is '{"alg":"HS256","typ":"JWT"}' base64url encoded
const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

let webToken;

module.exports = class WebToken {
  static init(config) {
    webToken = new WebToken(config);
  }

  static instance() {
    if (!webToken) {
      throw new Error('webToken not initialized');
    }
    return webToken;
  }

  constructor(config) {
    this.config = config;
  }

  generateAccessToken(user) {
    const userId = user.id;
    const { roles } = user;
    const fullToken = jwt.sign({ userId, roles }, this.config.secret, { algorithm: 'HS256', expiresIn: this.config.expiresIn });
    const authToken = fullToken.slice(fullToken.indexOf('.') + 1);
    const expiresAt = moment().add(this.config.expiresIn, 'seconds');
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>generatedToken', { authToken, expiresAt });
    return {
      authToken: fullToken.slice(fullToken.indexOf('.') + 1),
      expiresIn: this.config.expiresIn,
    };
  }

  decodeAccessToken(token) {
    const fullToken = `${header}.${token}`;
    try {
      const payload =  jwt.verify(fullToken, this.config.secret);
      return {
        roles: payload.roles,
        userId: payload.userId,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid token!');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Expired token!');
      } else {
        throw new Error('Invalid signature!');
      }
    }
  }
};

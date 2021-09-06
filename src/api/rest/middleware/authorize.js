const WebToken = require('../../../lib/web-token');
const userDbHandler = require('../../../db-handlers/user');
const userRefreshTokens = require('../../../db-handlers/user-refresh-token');
const moment = require('moment');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const now = moment(Date.now());
  console.log({ authHeader, now })
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const { userId, roles } = WebToken.instance().decodeAccessToken(token);
    const user = await userDbHandler.getById(userId); console.log({ user })

    // authentication and authorization successful
    req.user = user;
    const refreshTokens = await userRefreshTokens.getUserRefreshTokens(user.id);
    req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
    next();
  } catch (error) {console.log({ error })
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

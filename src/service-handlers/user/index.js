
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const log = require('loglevel');

const userDbHandler = require('../../db-handlers/user');
const userAuthDbHandler = require('../../db-handlers/user-auth');
const userRefreshTokenDbHandler = require('../../db-handlers/user-refresh-token');
const userRoleDbHandler = require('../../db-handlers/user-role');
const userProfileDbHandler = require('../../db-handlers/user-profile');
const ravenService = require('../../lib/raven');
const WebToken = require('../../lib/web-token');
const SirvClient = require('../../service-clients/SirvClient');

const register = async ({ userData, roles }, ip) => {
  const { email, password } = userData;
  let user = await userDbHandler.create(email);

  if (roles && roles.length > 0) {
    await userRoleDbHandler.setRolesForUser(user.id, roles);
  }

  user = await userDbHandler.getById(user.id);

  const passwordHash = await bcrypt.hash(password, 10);
  const authData = {
    password: passwordHash,
    ip,
  };
  await userAuthDbHandler.create(user.id, authData);

  const { authToken, expiresIn } = WebToken.instance().generateAccessToken(user);

  const refreshToken = await userRefreshTokenDbHandler.create(user.id, {
    userId: user.id,
    token: crypto.randomBytes(40).toString('hex'),
    expiresAt: new Date(Date.now() + 7*24*60*60*1000),
    ip,
  });

  return {
    authToken,
    expiresIn,
    refreshToken: refreshToken.token,
    refreshTokenExpiresIn: 7*24*60*60*1000,
  };
};

const auth = async ({ email, password }, ip) => {
  const user = await userDbHandler.getByEmail(email);
  await userAuthDbHandler.validate(user.id, password, ip);

  const { authToken, expiresIn } = WebToken.instance().generateAccessToken(user);

  const refreshToken = await userRefreshTokenDbHandler.create(user.id, {
    userId: user.id,
    token: crypto.randomBytes(40).toString('hex'),
    expiresAt: new Date(Date.now() + 7*24*60*60*1000),
    ip,
  });

  return {
    authToken,
    expiresIn,
    refreshToken: refreshToken.token,
    refreshTokenExpiresIn: 7*24*60*60*1000,
  };
};

const refreshToken = async (token, ip) => {
  const oldToken = await userRefreshTokenDbHandler.get(token);
  const newToken = await userRefreshTokenDbHandler.create(oldToken.userId, {
    userId: oldToken.userId,
    token: crypto.randomBytes(40).toString('hex'),
    expiresAt: new Date(Date.now() + 7*24*60*60*1000),
    ip,
  });

  await userRefreshTokenDbHandler.update(oldToken.id, {
    revokedAt: Date.now(),
    revokedByIp: ip,
    replacedByToken: newToken.token,
  });

  const user = await userDbHandler.getById(oldToken.userId);

  const { authToken, expiresIn } = WebToken.instance().generateAccessToken(user);

  return {
    authToken,
    expiresIn,
    refreshToken: newToken.token,
    refreshTokenExpiresIn: 7*24*60*60*1000,
  };
};

const revokeToken = async (token, ip) => {
  const oldToken = await userRefreshTokenDbHandler.get(token);
  await userRefreshTokenDbHandler.update(oldToken.id, {
    ...oldToken,
    revokedAt: new Date(Date.now()),
    revokedByIp: ip,
  });
};

const updateProfile = async (user, profile) => {
  let avatar, avatarBackground = 'https://picsum.photos/500/800';
  if (profile.avatar) {
    avatar = await SirvClient
      .instance()
      .uploadFile(`/users/${user.id}-avatar.jpg`, profile.avatar);
  }

  if (profile.avatarBackground) {
    avatarBackground = await SirvClient
      .instance()
      .uploadFile(`/users/${user.id}-avatar-background.jpg`, profile.avatarBackground);
  }

  await userProfileDbHandler.upsert(
    user.id, {
      ...profile,
      avatar,
      avatarBackground,
    },
  );
};

module.exports = {
  auth,
  refreshToken,
  revokeToken,
  register,
  updateProfile,
};

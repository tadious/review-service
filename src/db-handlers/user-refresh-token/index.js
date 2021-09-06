const db = require('../../lib/db');
const mappers = require('../mappers');
const {
  UserNotFoundError, InvalidRefreshToken, UserRefreshTokenNotFoundError,
} = require('../user/errors');

const create = (userId, refreshTokenData) => db.transaction(async (transacting) => {
  const UserRefreshToken = db.model('UserRefreshToken');
  const User = db.model('User');

  try {
    await User.where({ id: userId }).fetch({ transacting });
    const userRefreshToken = await UserRefreshToken.forge(
      mappers.userRefreshToken.create(
        userId,
        refreshTokenData,
      ),
    ).save(null, { transacting });

    return mappers.userRefreshToken.expose(userRefreshToken);
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      throw new UserNotFoundError(`No user found ${userId}`);
    }
  }
});

const get = token => db.transaction(async (transacting) => {
  const UserRefreshToken = db.model('UserRefreshToken');

  const refreshToken = await UserRefreshToken
    .where({ token })
    .fetch({ transacting, require: false });

  if (!refreshToken) {
    throw new InvalidRefreshToken('Token not found or has expired.');
  }

  return mappers.userRefreshToken.expose(refreshToken);
});

const update = (id, updateFields) => db.transaction(async (transacting) => {
  const UserRefreshToken = db.model('UserRefreshToken');

  try {
    const refreshToken = await UserRefreshToken.where({ id }).fetch({ transacting });
    await refreshToken.save(
      mappers.userRefreshToken.create(
        updateFields.userId,
        updateFields,
      ),
      { transacting, method: 'update' },
    );
  } catch (error) {
    if (error instanceof UserRefreshToken.NotFoundError) {
      throw new UserRefreshTokenNotFoundError('Refresh Token not found.');
    }
  }
});

const getUserRefreshTokens = userId => db.transaction(async (transacting) => {
  const UserRefreshToken = db.model('UserRefreshToken');
  const refreshTokens = await UserRefreshToken.where({ user_id: userId }).fetchAll({ transacting });
  return refreshTokens.map(token => mappers.userRefreshToken.expose(token));
});

module.exports = {
  create,
  get,
  update,
  getUserRefreshTokens,
};

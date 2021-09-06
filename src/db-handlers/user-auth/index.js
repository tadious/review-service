const db = require('../../lib/db');
const log = require('loglevel');
const bcrypt = require('bcryptjs');

const mappers = require('../mappers');
const { AuthenticationError, UserNotFoundError } = require('../user/errors');

const create = (userId, authData) => db.transaction(async (transacting) => {
  const User = db.model('User');
  const UserAuth = db.model('UserAuth');

  try {
    await User.where({ id: userId }).fetch({ transacting });
    await UserAuth
      .forge(mappers.userAuth.create(userId, authData))
      .save(null, { transacting });
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      log.info('No user found', { userId });
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }
    throw error;
  }
});

const validate = (userId, password, ip) => db.transaction(async (transacting) => {
  const UserAuth = db.model('UserAuth');
  try {
    const userAuth = await UserAuth.where({ user_id: userId, ip }).fetch({ transacting });
    const valid = await bcrypt.compare(password, userAuth.get('password'));
    if (!valid) {
      throw new AuthenticationError('Wrong password input');
    }
  } catch (error) {
    if (error instanceof UserAuth.NotFoundError) {
      log.info('No user found', { userId });
      throw new AuthenticationError('Wrong password input');
    }
    throw error;
  }
});

module.exports = {
  create,
  validate,
};

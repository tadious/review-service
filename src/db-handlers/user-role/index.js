const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');
const { UserNotFoundError } = require('../user/errors');

const setRolesForUser = (userId, roles) => db.transaction(async (transacting) => {
  const UserRole = db.model('UserRole');
  const User = db.model('User');

  try {
    await User.where({ id: userId }).fetch({ transacting });
    await UserRole.where({ user_id: userId }).destroy({ transacting });
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      throw new UserNotFoundError(`No user found ${userId}`);
    }
    if (!(error instanceof UserRole.NoRowsDeletedError)) {
      throw error;
    }
  }

  if (roles.length === 0) {
    log.info('Removed all roles', { userId });
    return [];
  }

  try {
    const userRoles = await Promise.all(
      roles.map(role => UserRole.forge(mappers.userRole.create(userId, role))
        .save(null, { transacting })),
    );
    return userRoles.map(mappers.userRole.expose);
  } catch (error) {
    log.error('Could not set roles', { userId, error });
    throw error;
  }
});

module.exports = {
  setRolesForUser,
};

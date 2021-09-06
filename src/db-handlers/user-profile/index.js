const db = require('../../lib/db');
const log = require('loglevel');

const mappers = require('../mappers');
const { UserNotFoundError } = require('../user/errors');

const upsert = (userId, profile) => db.transaction(async (transacting) => {
  const User = db.model('User');
  const UserProfile = db.model('UserProfile');

  try {
    await User.where({ id: userId }).fetch({ transacting });
    const userProfile = await UserProfile.where({ user_id: userId }).fetch({ transacting, require: false });
    if (userProfile) {
      await UserProfile
        .forge({ id: userProfile.get('id') })
        .save(
          mappers.userProfile.create(userId, profile), 
          { transacting, method: 'update' },
        );
    } else {
      await UserProfile
        .forge(mappers.userProfile.create(userId, profile))
        .save(null, { transacting, method: 'insert' });  
    }
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      log.info('No user found', { userId });
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }
    throw error;
  }
});

module.exports = {
  upsert,
};

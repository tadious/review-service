const db = require('../../lib/db');
const log = require('loglevel');
const mappers = require('../mappers');
const { UserNotFoundError, DuplicateEmailError, DuplicateMobileNumberError } = require('./errors');

const LOG_NAMESPACE = 'db-handlers:user';

const create = (email) => db.transaction(async (transacting) => {
  const User = db.model('User');
  try {
    const user = await User.forge(mappers.user.create({ email })).save(null, { transacting });
    return mappers.user.expose(user);
  } catch (error) {
    if (error instanceof Error && error.code === 'ER_DUP_ENTRY') {
      log.info(`${LOG_NAMESPACE}: Email address already exists`, { email });
      throw new DuplicateEmailError(`Email address ${email} already exists`);
    }
    log.error(`${LOG_NAMESPACE}: Could not create user`, { email, error });
    throw error;
  }
});

const getAll = () => db.transaction(async (transacting) => {
  const User = db.model('User');
  try {
    const dbUsers = await User
      .fetchAll({
        withRelated: [
          'roles',
          'profile',
          'followers',
          'following'
        ],
        transacting,
      });
    return dbUsers.map(user => mappers.user.expose(user));
  } catch (error) {
    log.error(`${LOG_NAMESPACE}: Could not fetch users`, { error });
    throw error;
  }
});

const getById = id => db.transaction(async (transacting) => {
  const User = db.model('User');
  try {
    const user = await User
      .where({ id, deactivated_at: null })
      .fetch({
        withRelated: [
          'roles',
          'profile',
          'followers',
          'following'
        ],
        transacting,
      });
    return mappers.user.expose(user);
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      log.info(`${LOG_NAMESPACE}: No user found`, { id });
      throw new UserNotFoundError(`No user found with id ${id}`);
    }
    log.error(`${LOG_NAMESPACE}: Could not get user by id`, { id, error });
    throw error;
  }
});

const getByEmail = email => db.transaction(async (transacting) => {
  const User = db.model('User');
  try {
    const user = await User
      .where({ email, deactivated_at: null })
      .fetch({
        withRelated: [
          'roles',
        ],
        transacting,
      });
    return mappers.user.expose(user);
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      log.info('No user found', { email });
      throw new UserNotFoundError(`No user found with email ${email}`);
    }
    log.error('Could not get user by email', { email, error });
    throw error;
  }
});

const getByMobilePhone = mobilePhone => db.transaction(async (transacting) => {
  const User = db.model('User');
  const user = await User
    .where({ mobile_phone: mobilePhone })
    .fetch({
      withRelated: ['auth', 'profile'],
      transacting,
      require: false,
    });
  return user ? mappers.user.expose(user) : undefined;
});

const update = (id, userData) => db.transaction(async (transacting) => {
  const User = db.model('User');
  try {
    const user = await User.where({ id, deactivated_at: null }).fetch({ transacting });
    await user.save(mappers.user.create(userData), { transacting });

    return mappers.user.expose(user);
  } catch (error) {
    if (error instanceof User.NotFoundError) {
      log.info('No user found', { id });
      throw new UserNotFoundError(`No user found with id ${id}`);
    }
    if (error instanceof Error && error.code === 'ER_DUP_ENTRY') {
      log.info('Email already exists', { email: userData.email });
      throw new DuplicateEmailError(`Email ${userData.email} already exists`);
    }
    log.error('Could not update user', { id, error });
    throw error;
  }
});

const deactivate = id => db.transaction(async (transacting) => {
  const User = db.model('User');
  try {
    await User
      .where({ id, deactivated_at: null })
      .save({ deactivated_at: new Date() }, { require: true, method: 'update', transacting });
  } catch (error) {
    if (error instanceof User.NoRowsUpdatedError) {
      log.info('No user found', { id });
      throw new UserNotFoundError(`No user found with id ${id}`);
    }
    log.error('Could not deactivate user', { id, error });
    throw error;
  }
});

module.exports = {
  create,
  getAll,
  getById,
  getByMobilePhone,
  getByEmail,
  update,
  deactivate,
};

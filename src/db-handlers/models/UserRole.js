const Bookshelf = require('bookshelf');

const enums = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },
};

/**
 * @description - Bookshelf model for UserRole.
 * @param {Bookshelf} bookshelf - Bookshelf instance.
 * @returns {Bookshelf.Model} - An UserRole model.
 */
const model = (bookshelf) => {
  const UserRole = bookshelf.Model.extend({
    tableName: 'user_roles',
    hasTimestamps: true,
    user() {
      return this.belongsTo('User');
    },
  });

  return bookshelf.model('UserRole', UserRole);
};

module.exports = {
  model,
  enums,
};

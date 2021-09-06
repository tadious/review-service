const Bookshelf = require('bookshelf');

const enums = {
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },
};

const model = (bookshelf) => {
  const UserAuth = bookshelf.Model.extend({
    tableName: 'user_auth',
    hasTimestamps: true,
    user() {
      return this.belongsTo('User');
    },
  });

  return bookshelf.model('UserAuth', UserAuth);
};

module.exports = {
  model,
  enums,
};

const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const UserRefreshToken = bookshelf.Model.extend({
    tableName: 'user_refresh_tokens',
    hasTimestamps: true,
    user() {
      return this.belongsTo('User');
    },
  });

  return bookshelf.model('UserRefreshToken', UserRefreshToken);
};

module.exports = {
  model,
};

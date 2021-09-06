const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const UserFollower = bookshelf.Model.extend({
    tableName: 'user_followers',
    hasTimestamps: true,
    user() {
      return this.belongsTo('User');
    },
  });

  return bookshelf.model('UserFollower', UserFollower);
};

module.exports = {
  model,
};

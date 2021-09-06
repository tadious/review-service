const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const UserProfile = bookshelf.Model.extend({
    tableName: 'user_profiles',
    hasTimestamps: true,
    user() {
      return this.belongsTo('User');
    },
  });

  return bookshelf.model('UserProfile', UserProfile);
};

module.exports = {
  model,
};

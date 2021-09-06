const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const UserSocialMedia = bookshelf.Model.extend({
    tableName: 'user_social_media',
    hasTimestamps: true,
    user() {
      return this.belongsTo('User');
    },
  });

  return bookshelf.model('UserSocialMedia', UserSocialMedia);
};

module.exports = {
  model,
};

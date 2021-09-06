const Bookshelf = require('bookshelf');

const model = (bookshelf) => {
  const User = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
    roles() {
      return this.hasMany('UserRole', 'user_id', 'id');
    },
    profile() {
      return this.hasOne('UserProfile', 'user_id', 'id');
    },
    followers() {
      return this.hasMany('UserFollower', 'follower_user_id', 'id');
    },
    following() {
      return this.hasMany('UserFollower', 'user_id', 'id');
    }
  });

  return bookshelf.model('User', User);
};

module.exports = {
  model,
};

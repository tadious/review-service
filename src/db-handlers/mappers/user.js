const userRoleMapper = require('./user-role');
const userFollowerMapper = require('./user-follower');
const userProfileMapper = require('./user-profile');
const reviewMapper = require('./review');

const create = userData => ({
  email: userData.email,
});

const expose = user => ({
  id: user.get('id'),
  email: user.get('email'),
  createdAt: user.get('created_at'),
  profile: user.related('profile') ? userProfileMapper.expose(user.related('profile')) : null,
  reviews: user.related('reviews') ? user.related('reviews')
    .map(review => reviewMapper.expose(review)) : [],
  roles: user.related('roles') ? user.related('roles')
    .map(userRole => userRoleMapper.expose(userRole)) : [],
  followers: user.related('followers') ? user.related('followers')
    .map(follower => userFollowerMapper.expose(follower)) : [],
  following: user.related('following') ? user.related('following')
    .map(follows => userFollowerMapper.expose(follows)) : [],
});

module.exports = {
  create,
  expose,
};

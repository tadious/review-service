const create = (userId, followerUserId) => ({
  user_id: userId,
  follower_user_id: followerUserId,
});

const expose = userFollower => ({
  userId: userFollower.get('user_id'),
  followerUserId: userFollower.get('follower_user_id'),
});

module.exports = {
  create,
  expose,
};

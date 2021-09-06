const create = (userId, profile) => ({
  user_id: userId,
  mobile_number: profile.mobileNumber,
  username: profile.username,
  name: profile.name,
  avatar: profile.avatar,
  avatar_background: profile.avatarBackground,
  birthday: profile.birthday,
  gender: profile.gender,
  bio: profile.bio,
});

const expose = profile => ({
  userId: profile.get('user_id'),
  mobileNumber: profile.get('mobile_number'),
  username: profile.get('username'),
  name: profile.get('name'),
  avatar: profile.get('avatar'),
  avatarBackground: profile.get('avatar_background'),
  birthday: profile.get('birthday'),
  gender: profile.get('gender'),
  bio: profile.get('bio'),
  interests: profile.get('interests'),
  emailVerifiedAt: profile.get('email_verified_at'),
  mobileNumberVerifiedAt: profile.get('mobile_number_verified_at'),
});

module.exports = {
  create,
  expose,
};

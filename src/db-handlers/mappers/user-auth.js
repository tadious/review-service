const create = (userId, auth) => ({
  user_id: userId,
  password: auth.password,
  ip: auth.ip,
});

const expose = auth => ({
  userId: auth.get('user_id'),
  passwordChangedAt: auth.get('password_changed_at'),
  ip: auth.get('ip'),
});

module.exports = {
  create,
  expose,
};

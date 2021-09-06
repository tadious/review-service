const create = (userId, refreshToken) => ({
  user_id: userId,
  token: refreshToken.token,
  expires_at: refreshToken.expiresAt,
  ip: refreshToken.ip,
  revoked_at: refreshToken.revokedAt,
  revoked_by_ip: refreshToken.revokedByIp,
  replaced_by_token: refreshToken.replacedByToken,
});

const expose = refreshToken => ({
  id: refreshToken.get('id'),
  userId: refreshToken.get('user_id'),
  token: refreshToken.get('token'),
  expiresAt: refreshToken.get('expires_at'),
  ip: refreshToken.get('ip'),
  revokedAt: refreshToken.get('revoked_at'),
  revokedByIp: refreshToken.get('revoked_by_ip'),
  replacedByToken: refreshToken.get('replaced_by_token'),
});

module.exports = {
  create,
  expose,
};

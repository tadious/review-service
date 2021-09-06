const { enums } = require('../models/UserRole');

const getKeyForValue = (obj, value) => Object.keys(obj).find(key => obj[key] === value);

const create = (userId, role) => ({
  user_id: userId,
  role: enums.ROLES[role],
});

const expose = userRole => (getKeyForValue(enums.ROLES, userRole.get('role')));

module.exports = {
  create,
  expose,
};

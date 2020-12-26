const { Errors } = require('../../../utils');
const { Validate } = require('../../../lib');

const validateAdminCredentials = (req, res, next) => {
  const { login, password } = req.body;

  if (!Validate.adminCredentials(login, password)) {
    throw new Errors.InvalidData('Логин или пароль указаны неверно');
  }

  next();
}

module.exports = validateAdminCredentials;

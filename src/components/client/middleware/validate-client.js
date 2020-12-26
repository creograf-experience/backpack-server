const { Errors } = require('../../../utils');
const { Validate } = require('../../../lib');

const validateClient = (req, res, next) => {
  const { name, email } = req.body;

  if (!Validate.client(name, email)) {
    throw new Errors.InvalidData('Заполните все обязательные поля');
  }

  if (!Validate.emailPattern(email)) {
    throw new Errors.InvalidData('Введите корректный email');
  }

  req.body.email = email.toLowerCase();
  next();
}

module.exports = validateClient;

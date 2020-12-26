const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const { PasswordEncrypter, Validate } = require('../../../lib');
const ClientModel = require('../model');

const validateClientCredentials = async (req, res, next) => {
  let { email, password } = req.body;

  if (!Validate.clientCredentials(email, password)) {
    throw new Errors.InvalidData('Email или пароль указаны неверно');
  }

  email = email.toLowerCase();

  const client = await ClientModel.findOne({ email });
  if (!client) {
    throw new Errors.NotFound('Клиента с таким email не существует');
  }

  if (client.isBlocked || client.isDeleted) {
    throw new Errors.InvalidData('Email или пароль указаны неверно');
  }

  const isMatch = await PasswordEncrypter.compare(client.password, password);
  if (!isMatch) {
    throw new Errors.InvalidData('Неверный пароль');
  }

  req.client = client;
  next();
}

module.exports = asyncRouteErrorHandler(validateClientCredentials);

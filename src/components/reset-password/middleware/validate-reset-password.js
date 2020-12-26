const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const { Validate } = require('../../../lib');
const ClientModel = require('../../client/model');

const validateClientCredentials = async (req, res, next) => {
  let { email } = req.body;

  if (!Validate.emailPattern(email)) {
    throw new Errors.InvalidData('Введите корректный email');
  }

  email = email.toLowerCase();

  const client = await ClientModel.findOne({ email });
  if (!client) {
    throw new Errors.NotFound('Клиента с таким email не существует');
  }

  req.client = client;
  next();
}

module.exports = asyncRouteErrorHandler(validateClientCredentials);

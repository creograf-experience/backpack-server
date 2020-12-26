const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const ClientModel = require('../model');

const findClient = async (req, res, next) => {
  const { clientId } = req.params;

  const client = await ClientModel.findById(clientId);
  if (!client) {
    throw new Errors.NotFound('Клиента не существует');
  }

  req.client = client;
  next();
}

module.exports = asyncRouteErrorHandler(findClient);

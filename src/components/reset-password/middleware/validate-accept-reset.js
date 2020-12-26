const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const ClientModel = require('../../client/model');

const validateAcceptReset = async (req, res, next) => {
  const { clientId, token } = req.params;

  if (!clientId || !token) {
    return res.status(400).send('<p>Неверные данные</p>')
  }

  const client = await ClientModel.findById(clientId);
  if (!client) {
    return res.status(404).send('<p>Клиента не существует</p>')
  }

  if (client.resetPasswordToken !== token) {
    return res.status(400).send('<p>Неверные данные</p>')
  }

  if (Date.now() > client.resetPasswordTokenExpireDate) {
    return res.status(400).send('<p>Ссылка больше не действительна</p>')
  }

  req.client = client;
  next();
}

module.exports = asyncRouteErrorHandler(validateAcceptReset);

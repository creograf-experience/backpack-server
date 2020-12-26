const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const { Validate } = require('../../../lib');
const ClientModel = require('../../client/model');

const validateCampaign = async (req, res, next) => {
  const { name, client, date, number } = req.body;

  if (number) {
    throw new Errors.InvalidData('Номер кампании нельзя редактировать');
  }

  if (!Validate.campaign(name, client, date)) {
    throw new Errors.InvalidData('Заполните все обязательные поля');
  }

  const existingClient = await ClientModel.findById(client);
  if (!existingClient) {
    throw new Errors.NotFound('Клиент не найден');
  }

  req.client = existingClient;
  next();
}

module.exports = asyncRouteErrorHandler(validateCampaign);

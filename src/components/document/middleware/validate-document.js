const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const CampaignModel = require('../../campaign/model');

const validateDocument = async (req, res, next) => {
  const { campaign } = req.body;

  if (!campaign || !campaign.trim().length) {
    throw new Errors.InvalidData('Не удалось загрузить документ');
  }

  if (!req.files.length) {
    throw new Errors.InvalidData('Не удалось загрузить документ');
  }

  const existingCampaign = await CampaignModel.findById(campaign);
  if (!existingCampaign) {
    throw new Errors.InvalidData('Не удалось загрузить документ');
  }

  req.campaign = existingCampaign;
  next();
}

module.exports = asyncRouteErrorHandler(validateDocument);

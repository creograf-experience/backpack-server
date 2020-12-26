const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const CampaignModel = require('../model');

const findCampaign = async (req, res, next) => {
  const { campaignId } = req.params;

  const campaign = await CampaignModel.findById(campaignId);
  if (!campaign) {
    throw new Errors.NotFound('Кампании не существует');
  }

  req.campaign = campaign;
  next();
}

module.exports = asyncRouteErrorHandler(findCampaign);

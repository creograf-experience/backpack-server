const { auth } = require('../../../middleware');
const validateCampaign = require('./validate-campaign');
const findCampaign = require('./find-campaign');

const read = [auth('admin')];
const readClient = [auth('client')];
const create = [auth('admin'), validateCampaign];
const update = [auth('admin'), findCampaign, validateCampaign];
const deleteCampaign = [auth('admin'), findCampaign];

module.exports = {
  read,
  readClient,
  create,
  update,
  deleteCampaign
};

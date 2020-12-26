const { auth } = require('../../../middleware');
const validateDocument = require('./validate-document');
const validateFiles = require('./validate-files');
const formData = require('multer')();
const findCampaign = require('../../campaign/middleware/find-campaign');
const findDocuments = require('./find-documents');
const findDocument = require('./find-document');

const read = [auth('admin'), findCampaign];
const readClient = [auth('client'), findCampaign];
const create = [auth('admin'), formData.array('documents', 5), validateDocument, validateFiles];
const deleteDocument = [auth('admin'), findCampaign, findDocuments];
const download = [findDocument];

module.exports = {
  read,
  create,
  deleteDocument,
  download,
  readClient
};

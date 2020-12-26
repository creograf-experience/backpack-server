const { auth } = require('../../../middleware');
const validateClient = require('./validate-client');
const validateFiles = require('./validate-files');
const validateClientCredentials = require('./validate-client-credentials');
const findClient = require('./find-client');
const formData = require('multer')();

const create = [
  auth('admin'),
  formData.fields([{ name: 'logo' }, { name: 'agencyLogo' }]),
  validateClient,
  validateFiles
];

const update = [
  auth('admin'),
  findClient,
  formData.fields([{ name: 'logo' }, { name: 'agencyLogo' }]),
  validateClient,
  validateFiles
];

const block = [auth('admin'), findClient];
const deleteClient = [auth('admin'), findClient];
const sendAccess = [auth('admin'), findClient];
const read = [auth('admin')];
const readClient = [auth('client')];
const login = [validateClientCredentials];

module.exports = {
  create,
  block,
  deleteClient,
  sendAccess,
  update,
  read,
  readClient,
  login
};

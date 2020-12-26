const { auth } = require('../../../middleware');
const validateDocument = require('./validate-document');
const validateFiles = require('./validate-files');
const formData = require('multer')();


const read = [auth('client')];
const create = [auth('admin'), formData.array('file'), validateFiles, validateDocument];


module.exports = {
  read,
  create
};
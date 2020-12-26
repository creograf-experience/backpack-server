const { auth } = require('../../../middleware');
const validateBackpack = require('./validate-backpack');
const findBackpack = require('./find-backpack');
const deleteBackpacks = require('./delete-backpack');

const read = [auth('admin')];
const create = [auth('admin'), validateBackpack];
const update = [auth('admin'), findBackpack];
const deleteBackpack = [auth('admin'), deleteBackpacks];

module.exports = {
  read,
  create,
  update,
  deleteBackpack
};

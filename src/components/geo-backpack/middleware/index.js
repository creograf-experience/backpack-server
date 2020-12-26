const { auth } = require('../../../middleware');
const findBackpack = require('./find-backpack');

const read = [];
const create = [findBackpack];


module.exports = {
  create,
  read
};

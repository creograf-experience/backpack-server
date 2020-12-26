const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const BackpackModel = require('../../backpack/model');

const findBackpack = async (req, res, next) => {
  const { backpackId } = req.params;

  const backpack = await BackpackModel.findOne({"idBackpack": backpackId});
  if (!backpack) {
    throw new Errors.NotFound('Рюкзака не существует');
  }

  req.backpack = backpack;
  next();
}

module.exports = asyncRouteErrorHandler(findBackpack);

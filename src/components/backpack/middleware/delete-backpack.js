const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const BackpackModel = require('../model');

const deleteBackpacks = async (req, res, next) => {
  const { backpackId } = req.params;

  const backpack = await BackpackModel.findById(backpackId);
  if (!backpack) {
    throw new Errors.NotFound('Рюкзака не существует');
  }

  req.backpack = backpack;
  next();
}

module.exports = asyncRouteErrorHandler(deleteBackpacks);
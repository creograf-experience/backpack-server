const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const BackpackModel = require('../../backpack/model');

const validateDocument = async (req, res, next) => {
  if (!req.files.length) {
    throw new Errors.InvalidData('Не удалось загрузить документ');
  }
  for (const file of req.files) {
    const backpackId = file.originalname.split('_')[0];
    const existingBackpack = await BackpackModel.findOne({"idBackpack": backpackId});
    if (!existingBackpack) {
      throw new Errors.InvalidData(`Не удалось загрузить документ, рюкзак ${backpackId} не найден `);
    }
    file.backpack = existingBackpack;
  }

  next();
}

module.exports = asyncRouteErrorHandler(validateDocument);
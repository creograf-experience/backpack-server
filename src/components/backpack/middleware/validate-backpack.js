const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const { Validate } = require('../../../lib');
const BackpackModel = require('../../backpack/model');

const validateBackpack = async (req, res, next) => {
  const { number, description, idBackpack } = req.body;

  if (!Validate.backpack(number, description, idBackpack)) {
    throw new Errors.InvalidData('Заполните все обязательные поля');
  }

  const numberBackpack = await BackpackModel.findOne({"number": number});
  if (numberBackpack) {
    throw new Errors.InvalidData('Рюкзак с таким номером уже существует');
  }

  const findIdBackpack = await BackpackModel.findOne({"idBackpack": idBackpack});
  if (findIdBackpack) {
    throw new Errors.InvalidData('Рюкзак с таким индентификатором уже существует');
  }

  next();
}

module.exports = asyncRouteErrorHandler(validateBackpack);

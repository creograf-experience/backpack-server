const { Errors, asyncRouteErrorHandler } = require('../../../utils');
const { Validate } = require('../../../lib');
const BackpackModel = require('../model');

const findBackpack = async (req, res, next) => {
  const { backpackId } = req.params;
  
  if (!Validate.backpack(req.body.number, req.body.description, req.body.idBackpack)) {
    throw new Errors.InvalidData('Заполните все обязательные поля');
  }

  const backpack = await BackpackModel.findById(backpackId);
  if (!backpack) {
    throw new Errors.NotFound('Рюкзака не существует');
  }

  if(backpack.number!==req.body.number){
    const numberBackpack = await BackpackModel.findOne({"number": req.body.number});
    if (numberBackpack) {
      throw new Errors.InvalidData('Рюкзак с таким номером уже существует');
    }
  }

  if(backpack.idBackpack!=req.body.idBackpack){
    const findIdBackpack = await BackpackModel.findOne({"idBackpack": req.body.idBackpack});
    if (findIdBackpack) {
      throw new Errors.InvalidData('Рюкзак с таким индентификатором уже существует');
    }
  }
 
  req.backpack = backpack;
  next();
}

module.exports = asyncRouteErrorHandler(findBackpack);

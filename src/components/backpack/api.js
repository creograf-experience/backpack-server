const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.get('/', middleware.read, controller.read);
router.post('/', middleware.create, controller.create);
router.put('/:backpackId', middleware.update, controller.update);
router.delete('/:backpackId', middleware.deleteBackpack, controller.deleteBackpack);

module.exports = router;
const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.post('/:backpackId', middleware.create, controller.create);
router.get('/', middleware.read, controller.read);

module.exports = router;
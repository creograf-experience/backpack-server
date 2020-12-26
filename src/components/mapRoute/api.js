const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.get('/', middleware.read, controller.read);
router.post('/', middleware.create, controller.create);

module.exports = router;
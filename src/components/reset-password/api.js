const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.post('/', middleware.resetPassword, controller.resetPassword);
router.get('/:clientId/:token', middleware.acceptReset, controller.acceptReset);

module.exports = router;

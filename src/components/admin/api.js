const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.post('/login', middleware.login, controller.login);

module.exports = router;

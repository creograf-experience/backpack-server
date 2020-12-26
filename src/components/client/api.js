const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.get('/', middleware.read, controller.read);
router.post('/', middleware.create, controller.create);
router.put('/:clientId', middleware.update, controller.update);
router.delete('/:clientId', middleware.deleteClient, controller.deleteClient);
router.put('/block/:clientId', middleware.block, controller.block);
router.put('/send-access/:clientId', middleware.sendAccess, controller.sendAccess);
router.post('/login', middleware.login, controller.login);
router.get('/client', middleware.readClient, controller.readClient)

module.exports = router;

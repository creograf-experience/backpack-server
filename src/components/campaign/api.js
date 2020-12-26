const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.get('/', middleware.read, controller.read);
router.post('/', middleware.create, controller.create);
router.put('/:campaignId', middleware.update, controller.update);
router.delete('/:campaignId', middleware.deleteCampaign, controller.deleteCampaign);
router.get('/client', middleware.readClient, controller.readClient)

module.exports = router;

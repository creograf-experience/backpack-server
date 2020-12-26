const router = require('express').Router();
const controller = require('./controller');
const middleware = require('./middleware');

router.get('/:campaignId', middleware.read, controller.read);
router.get('/client/:campaignId', middleware.readClient, controller.readClient)
router.post('/', middleware.create, controller.create);
router.delete('/:campaignId', middleware.deleteDocument, controller.deleteDocument);

router.get('/download/:documentId', middleware.download, controller.download);

module.exports = router;

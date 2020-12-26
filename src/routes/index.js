const adminRoutes = require('../components/admin/api');
const clientRoutes = require('../components/client/api');
const campaignRoutes = require('../components/campaign/api');
const documentRoutes = require('../components/document/api');
const resetPasswordRoutes = require('../components/reset-password/api');
const backpackRoutes = require('../components/backpack/api');
const geoBackpackRoutes = require('../components/geo-backpack/api');
const mapRouteRoutes = require('../components/mapRoute/api');

const routes = require('express').Router();

routes.use('/admin', adminRoutes);
routes.use('/clients', clientRoutes);
routes.use('/campaigns', campaignRoutes);
routes.use('/documents', documentRoutes);
routes.use('/reset-password', resetPasswordRoutes);
routes.use('/backpacks', backpackRoutes);
routes.use('/geobackpacks', geoBackpackRoutes);
routes.use('/map-routes', mapRouteRoutes);

module.exports = routes;

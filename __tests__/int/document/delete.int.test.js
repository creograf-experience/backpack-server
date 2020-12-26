const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const CampaignModel = require('../../../src/components/campaign/model');
const ClientModel = require('../../../src/components/client/model');
const DocumentModel = require('../../../src/components/document/model');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let newClient;
let newCampaign;
let newDocument;

beforeAll(async () => {
  newClient = await ClientModel.create({
    name: 'test',
    email: 'test@test.com'
  });

  newCampaign = await CampaignModel.create({
    number: 100000,
    name: 'test-campaign',
    client: newClient._id,
    date: { from: '2020-05-01', to: '2020-05-08' },
    documentCount: 4
  });

  newDocument = await DocumentModel.create({
    campaign: newCampaign._id,
    friendlyName: 'test-document.pdf',
    ext: 'pdf'
  });
});

afterAll(async () => {
  await Promise.all([
    CampaignModel.deleteMany(),
    ClientModel.deleteMany(),
    DocumentModel.deleteMany()
  ]);
  await mongoose.connection.close();
});

describe('DELETE /documents/:campaign_id', () => {
  const requestUrl = '/documents/';

  const wrongToken = jwt.sign(
    { login: 'test', role: 'admin' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  const wrongRoleToken = jwt.sign(
    { login: config.admin.login, role: 'client' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  const correctToken = jwt.sign(
    { login: config.admin.login, role: 'admin' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  it('should responde with status 401 no token', done => {
    request(app)
      .delete(requestUrl + newCampaign._id.toString())
      .expect(401, done);
  });

  it('should responde with status 401 wrong token', done => {
    request(app)
      .delete(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401 wrong role token', done => {
    request(app)
      .delete(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + wrongRoleToken)
      .expect(401, done);
  });

  it('should responde with status 404 if campaign does not exist', done => {
    request(app)
      .delete(requestUrl + newCampaign._id.toString().slice(1) + '5')
      .set('Authorization', 'Bearer ' + correctToken)
      .send({ documentIds: [newDocument._id] })
      .expect(404, done);
  });

  it('should responde with status 404 if document does not exist', done => {
    request(app)
      .delete(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + correctToken)
      .send({ documentIds: [String(newDocument._id).slice(1) + '5'] })
      .expect(404, done);
  });

  it('should responde with status 200', async done => {
    await fs.copyFile(
      `${config.rootPath}/__tests__/fixtures/document.pdf`,
      `${config.documentsFolderPath}/${newDocument._id}.${newDocument.ext}`
    );
    request(app)
      .delete(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + correctToken)
      .send({ documentIds: [newDocument._id] })
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success } = res.body;
        const campaign = await CampaignModel.findById(newCampaign._id);
        const document = await DocumentModel.findById(newDocument._id);

        expect(success).toBe(true);
        expect(campaign.documentCount).toBe(newCampaign.documentCount - 1);
        expect(document).toBe(null);

        done();
      });
  });
});

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

beforeAll(async () => {
  newClient = await ClientModel.create({
    name: 'test',
    email: 'test@test.com'
  });

  newCampaign = await CampaignModel.create({
    number: 100000,
    name: 'test-campaign',
    client: newClient._id,
    date: { from: '2020-05-01', to: '2020-05-08' }
  });
});

beforeEach(async () => {
  await DocumentModel.deleteMany();
});

afterAll(async () => {
  await Promise.all([
    CampaignModel.deleteMany(),
    ClientModel.deleteMany(),
    DocumentModel.deleteMany()
  ]);
  await mongoose.connection.close();
});

describe('POST /documents', () => {
  const requestUrl = '/documents';

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
      .post(requestUrl)
      .expect(401, done);
  });

  it('should responde with status 401 wrong token', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401 wrong role token', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + wrongRoleToken)
      .expect(401, done);
  });

  it('should responde with status 400 no body', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(400, done);
  });

  it('should responde with status 400 empty campaign id', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('campaign', '')
      .expect(400, done);
  });

  it('should responde with status 400 whitespace campaign id', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('campaign', '  ')
      .expect(400, done);
  });

  it('should responde with status 400 no files', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('campaign', String(newCampaign._id))
      .expect(400, done);
  });

  it('should responde with status 400 wrong files', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('campaign', String(newCampaign._id))
      .attach('documents', '__tests__/fixtures/document.doc')
      .attach('documents', '__tests__/fixtures/avatar.png')
      .attach('documents', '__tests__/fixtures/document.xls')
      .expect(400, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('campaign', String(newCampaign._id))
      .attach('documents', '__tests__/fixtures/document.doc')
      .attach('documents', '__tests__/fixtures/document.pdf')
      .attach('documents', '__tests__/fixtures/document.xls')
      .attach('documents', '__tests__/fixtures/document.xlsx')
      .attach('documents', '__tests__/fixtures/document.docx')
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { documents } = data;

        const campaign = await CampaignModel.findById(newCampaign._id);

        expect(success).toBe(true);
        expect(documents.length).toBe(5);
        expect(campaign.documentCount).toBe(documents.length);

        for (const doc of documents) {
          expect(doc.campaign).toBe(newCampaign._id.toString());
          expect(await fs.access(`${config.documentsFolderPath}/${doc._id}.${doc.ext}`));
        }

        const promises = documents.map(doc => fs.unlink(`${config.documentsFolderPath}/${doc._id}.${doc.ext}`));
        await Promise.all(promises);

        done();
      });
  });
});

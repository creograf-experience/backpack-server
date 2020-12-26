const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const CampaignModel = require('../../../src/components/campaign/model');
const ClientModel = require('../../../src/components/client/model');
const DocumentModel = require('../../../src/components/document/model');
const jwt = require('jsonwebtoken');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const documentsAmount = 15;

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

  let documents = [];
  for (let i = 1; i < documentsAmount; i++) {
    documents.push({
      campaign: i <= 8 ? newCampaign._id : String(newCampaign._id).slice(1) + '5',
      friendlyName: 'test-' + i,
      ext: 'pdf'
    });
  }

  await DocumentModel.insertMany(documents);
});

afterAll(async () => {
  await Promise.all([
    CampaignModel.deleteMany(),
    ClientModel.deleteMany(),
    DocumentModel.deleteMany()
  ]);
  await mongoose.connection.close();
});

describe('GET /documents/:campaign_id', () => {
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
      .get(requestUrl + newCampaign._id.toString())
      .expect(401, done);
  });

  it('should responde with status 401 wrong token', done => {
    request(app)
      .get(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401 wrong role token', done => {
    request(app)
      .get(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + wrongRoleToken)
      .expect(401, done);
  });

  it('should responde with status 404 if campaign not found', done => {
    request(app)
      .get(requestUrl + newCampaign._id.toString().slice(1) + '5')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(404, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .get(requestUrl + newCampaign._id.toString())
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        const { data, success } = res.body;
        const { documents } = data;

        expect(success).toBe(true);
        expect(documents.length).toBe(8);

        done();
      });
  });
});

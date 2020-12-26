const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const CampaignModel = require('../../../src/components/campaign/model');
const ClientModel = require('../../../src/components/client/model');
const jwt = require('jsonwebtoken');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let newClient;
let newClient2;
let newCampaign;

beforeAll(async () => {
  [newClient, newClient2] = await Promise.all([
    ClientModel.create({ name: 'test', email: 'test@test.com' }),
    ClientModel.create({ name: 'test-name-2', email: 'test2@email.com' })
  ]);
});

beforeEach(async () => {
  await CampaignModel.deleteMany();
  newCampaign = await CampaignModel.create({
    number: 100000,
    name: 'test-campaign',
    client: newClient._id,
    date: { from: '2020-05-01', to: '2020-05-08' }
  });
});

afterAll(async () => {
  await Promise.all([
    CampaignModel.deleteMany(),
    ClientModel.deleteMany()
  ]);
  await mongoose.connection.close();
});

describe('PUT /campaigns/:id', () => {
  const requestUrl = '/campaigns/';

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
      .put(requestUrl + String(newCampaign._id))
      .expect(401, done);
  });

  it('should responde with status 401 wrong token', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401 wrong role token', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + wrongRoleToken)
      .expect(401, done);
  });

  it('should responde with status 400 no body', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(400, done);
  });

  it('should responde with status 404 no campaign found', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id).slice(1) + '5')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(404, done);
  });

  it('should responde with status 400 empty name', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: '',
        client: newClient._id,
        date: { from: '2020-05-08', to: '2020-05-10' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 empty name', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: ' ',
        client: newClient._id,
        date: { from: '2020-05-08', to: '2020-05-10' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 empty client', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: '',
        date: { from: '2020-05-08', to: '2020-05-10' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 if somehow there is a number field', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { from: '2020-05-08', to: '2020-05-10' },
        number: 123456
      })
      .expect(400, done);
  });

  it('should responde with status 400 empty client', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: ' ',
        date: { from: '2020-05-08', to: '2020-05-10' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 no date', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id
      })
      .expect(400, done);
  });

  it('should responde with status 400 empty date', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: {}
      })
      .expect(400, done);
  });

  it('should responde with status 400 date is not object', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: 'test-date'
      })
      .expect(400, done);
  });

  it('should responde with status 400 date.to is empty', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { to: '', from: '2020-05-08' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 date.to is wrong format', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { from: '2020-12-23', to: '20a20-b12-25c' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 date.from is empty', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { from: '', to: '2020-05-08' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 date.from is wrong format', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { to: '2020-12-23', from: '20a20-b12-25c' }
      })
      .expect(400, done);
  });

  it('should responde with status 404 client does not exist', done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: String(newClient._id).slice(1) + '5',
        date: { from: '2020-05-01', to: '2020-05-08' }
      })
      .expect(404, done);
  });

  it('should responde with status 200 with only required fields', async done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name-updated',
        client: newClient2._id,
        date: { from: '2020-05-05', to: '2020-05-13' }
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { campaign } = data;

        expect(success).toBe(true);
        expect(campaign._id).toBe(newCampaign._id.toString());

        expect(campaign.number).toBe(newCampaign.number);

        expect(campaign.name).toBe('test-name-updated');

        expect(campaign.client._id).toBe(newClient2._id.toString());
        expect(campaign.client.name).toBe(newClient2.name);
        expect(campaign.client.email).toBe(newClient2.email);

        expect(campaign.date.from).toBe('2020-05-05');
        expect(campaign.date.to).toBe('2020-05-13');

        done();
      });
  });

  it('should responde with status 200 with all fields', async done => {
    request(app)
      .put(requestUrl + String(newCampaign._id))
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name-updated',
        client: newClient2._id,
        date: { from: '2020-05-05', to: '2020-05-13' },
        dayPart: { morning: true, evening: true },
        status: 'archived',
        photoReportUrl: 'test-photo-url',
        MAC: { isVisible: true },
        GRP: { isVisible: true },
        Frequency: { isVisible: true },
        OTS: { isVisible: true }
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { campaign } = data;

        expect(success).toBe(true);
        expect(campaign._id).toBe(newCampaign._id.toString());

        expect(campaign.number).toBe(newCampaign.number);

        expect(campaign.name).toBe('test-name-updated');

        expect(campaign.client._id).toBe(newClient2._id.toString());
        expect(campaign.client.name).toBe(newClient2.name);
        expect(campaign.client.email).toBe(newClient2.email);

        expect(campaign.date.from).toBe('2020-05-05');
        expect(campaign.date.to).toBe('2020-05-13');

        expect(campaign.photoReportUrl).toBe('test-photo-url');
        expect(campaign.status).toBe('archived');
        expect(campaign.dayPart.morning).toBe(true);
        expect(campaign.dayPart.evening).toBe(true);
        expect(campaign.MAC.isVisible).toBe(true);
        expect(campaign.GRP.isVisible).toBe(true);
        expect(campaign.Frequency.isVisible).toBe(true);
        expect(campaign.OTS.isVisible).toBe(true);

        done();
      });
  });
});

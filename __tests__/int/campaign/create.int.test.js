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

beforeAll(async () => {
  newClient = await ClientModel.create({
    name: 'test',
    email: 'test@test.com'
  });
});

beforeEach(async () => {
  await CampaignModel.deleteMany();
});

afterAll(async () => {
  await Promise.all([
    CampaignModel.deleteMany(),
    ClientModel.deleteMany()
  ]);
  await mongoose.connection.close();
});

describe('POST /campaigns', () => {
  const requestUrl = '/campaigns';

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

  it('should responde with status 400 empty name', done => {
    request(app)
      .post(requestUrl)
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
      .post(requestUrl)
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
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: '',
        date: { from: '2020-05-08', to: '2020-05-10' }
      })
      .expect(400, done);
  });

  it('should responde with status 400 empty client', done => {
    request(app)
      .post(requestUrl)
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
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id
      })
      .expect(400, done);
  });

  it('should responde with status 400 empty date', done => {
    request(app)
      .post(requestUrl)
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
      .post(requestUrl)
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
      .post(requestUrl)
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
      .post(requestUrl)
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
      .post(requestUrl)
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
      .post(requestUrl)
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
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: String(newClient._id).slice(1) + '5',
        date: { from: '2020-05-01', to: '2020-05-08' }
      })
      .expect(404, done);
  });

  it('should responde with status 200 with only required fields', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { from: '2020-05-01', to: '2020-05-08' }
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { campaign } = data;

        expect(success).toBe(true);
        expect(campaign._id).toBeTruthy();

        expect(campaign.number).toBeTruthy();
        expect(campaign.number.length).toBe(6);

        expect(campaign.name).toBe('test-name');

        expect(campaign.client._id).toBe(newClient._id.toString());
        expect(campaign.client.name).toBe(newClient.name);
        expect(campaign.client.email).toBe(newClient.email);

        expect(campaign.date.from).toBe('2020-05-01');
        expect(campaign.date.to).toBe('2020-05-08');

        done();
      });
  });

  it('should responde with status 200 with all fields', done => {
    request(app)
      .post(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .send({
        name: 'test-name',
        client: newClient._id,
        date: { from: '2020-05-01', to: '2020-05-08' },
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
        expect(campaign._id).toBeTruthy();

        expect(campaign.number).toBeTruthy();
        expect(campaign.number.length).toBe(6);

        expect(campaign.name).toBe('test-name');

        expect(campaign.client._id).toBe(newClient._id.toString());
        expect(campaign.client.name).toBe(newClient.name);
        expect(campaign.client.email).toBe(newClient.email);

        expect(campaign.date.from).toBe('2020-05-01');
        expect(campaign.date.to).toBe('2020-05-08');

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

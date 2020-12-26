const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const ClientModel = require('../../../src/components/client/model');
const CampaignModel = require('../../../src/components/campaign/model');
const jwt = require('jsonwebtoken');
const { Randomizer } = require('../../../src/lib');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const documentAmount = 30;
const limit = 20;

let newClient;
let newClient2;

beforeAll(async () => {
  [newClient, newClient2] = await Promise.all([
    ClientModel.create({
      name: 'test-name-1',
      email: 'test1@email.com',
    }),
    ClientModel.create({
      name: 'test-name-2',
      email: 'test2@email.com',
    }),
  ]);

  let campaigns = [];

  for (let i = 0; i < documentAmount; i++) {
    campaigns.push({
      number: Randomizer.generateRandomNum(899999, 100000),
      name: `${i}-test-name`,
      client: i < 20 ? newClient._id : newClient2._id,
      date: {
        from: `${('202' + i).slice(0, 4)}-05-01`,
        to: `${('202' + i).slice(0, 4)}-05-08`
      },
      status: i < 20 ? 'active' : 'archived'
    });
  }

  await CampaignModel.insertMany(campaigns);
});

afterAll(async () => {
  await Promise.all([
    ClientModel.deleteMany(),
    CampaignModel.deleteMany()
  ]);
  await mongoose.connection.close();
});

describe('GET /campaigns', () => {
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
      .get(requestUrl)
      .expect(401, done);
  });

  it('should responde with status 401 wrong token', done => {
    request(app)
      .get(requestUrl)
      .set('Authorization', 'Bearer ' + wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401 wrong role token', done => {
    request(app)
      .get(requestUrl)
      .set('Authorization', 'Bearer ' + wrongRoleToken)
      .expect(401, done);
  });

  it('should responde with status 200 and return all documents', done => {
    request(app)
      .get(requestUrl)
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;
        const { campaigns } = data;

        expect(success).toBe(true);
        expect(campaigns.length).toBe(documentAmount);
        expect(metadata.totalCount).toBe(documentAmount);

        expect(campaigns[0].client._id).toBeTruthy();
        expect(campaigns[0].client.name).toBeTruthy();
        expect(campaigns[0].client.email).toBeTruthy();

        done();
      });
  });

  it('should responde with status 200 with pagination', done => {
    request(app)
      .get(requestUrl + '?page=1')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;
        const { campaigns } = data;

        expect(success).toBe(true);

        expect(campaigns[0].name).toBe('0-test-name');
        expect(campaigns[campaigns.length - 1].name).toBe('19-test-name');
        expect(campaigns.length).toBe(limit);
        expect(metadata.totalCount).toBe(documentAmount);
        expect(metadata.currentPage).toBe(1);
        expect(metadata.totalPages).toBe(Math.ceil(documentAmount / limit));

        done();
      });
  });

  it('should responde with status 200 with search by campaign number', done => {
    request(app)
      .get(requestUrl + '?search=5')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;
        const { campaigns } = data;

        expect(success).toBe(true);

        for (const campaign of campaigns) {
          expect(campaign.number.includes('5')).toBe(true);
        }

        expect(campaigns.length).toBeLessThan(documentAmount);

        done();
      });
  });

  it('should responde with status 200 with search by client name', done => {
    request(app)
      .get(requestUrl + '?search=test-name-1')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;
        const { campaigns } = data;

        expect(success).toBe(true);
        expect(campaigns.length).toBe(20);

        for (const campaign of campaigns) {
          expect(campaign.client.name).toBe('test-name-1');
        }

        done();
      });
  });

  it('should responde with status 200 with search by client email', done => {
    request(app)
      .get(requestUrl + '?search=test2@email.com')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;
        const { campaigns } = data;

        expect(success).toBe(true);
        expect(campaigns.length).toBe(10);

        for (const campaign of campaigns) {
          expect(campaign.client.email).toBe('test2@email.com');
        }

        done();
      });
  });

  it('should responde with status 200 with filter by status', done => {
    request(app)
      .get(requestUrl + '?filter=archived')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;
        const { campaigns } = data;

        expect(success).toBe(true);
        expect(campaigns.length).toBe(10);

        for (const campaign of campaigns) {
          expect(campaign.status).toBe('archived');
        }

        done();
      });
  });
});

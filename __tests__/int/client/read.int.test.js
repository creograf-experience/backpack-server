const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const ClientModel = require('../../../src/components/client/model');
const jwt = require('jsonwebtoken');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

beforeAll(async () => {
  await ClientModel.deleteMany();

  let clients = [];

  for (let i = 0; i < 50; i++) {
    clients.push({
      name: `test-name-${i}`,
      email: `test-email-${i}@example.com`,
      phone: `${i}${i+1}${i+2}${i+3}`,
      legalEntity: `test-legal-entity-${i}`,
      agency: { name: i }
    });
  }

  await ClientModel.insertMany(clients);
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await mongoose.connection.close();
});

describe('GET /clients', () => {
  const correctToken = jwt.sign(
    { login: config.admin.login, role: 'admin' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  it('should responde with status 401', done => {
    request(app)
      .get('/clients')
      .expect(401, done);
  });

  it('should responde with status 200 and return all documents', done => {
    request(app)
      .get('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;

        expect(success).toBe(true);
        expect(data.clients.length).toBe(50);
        expect(metadata.totalCount).toBe(50);

        done();
      });
  });

  it('should responde with status 200 with pagination', done => {
    request(app)
      .get('/clients?page=1')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;

        expect(success).toBe(true);

        expect(data.clients[0].name).toBe('test-name-0');
        expect(data.clients[data.clients.length - 1].name).toBe('test-name-19');
        expect(data.clients.length).toBe(20);
        expect(metadata.totalCount).toBe(50);
        expect(metadata.currentPage).toBe(1);
        expect(metadata.totalPages).toBe(3);

        done();
      });
  });

  it('should responde with status 200 with pagination', done => {
    request(app)
      .get('/clients?page=2')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;

        expect(success).toBe(true);

        expect(data.clients[0].name).toBe('test-name-20');
        expect(data.clients[data.clients.length - 1].name).toBe('test-name-39');
        expect(data.clients.length).toBe(20);
        expect(metadata.totalCount).toBe(50);
        expect(metadata.currentPage).toBe(2);
        expect(metadata.totalPages).toBe(3);

        done();
      });
  });

  it('should responde with status 200 with pagination', done => {
    request(app)
      .get('/clients?page=3')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end((err ,res) => {
        if (err) return done(err);

        const { success, data, metadata } = res.body;

        expect(success).toBe(true);

        expect(data.clients[0].name).toBe('test-name-40');
        expect(data.clients[data.clients.length - 1].name).toBe('test-name-49');
        expect(data.clients.length).toBe(10);
        expect(metadata.totalCount).toBe(50);
        expect(metadata.currentPage).toBe(3);
        expect(metadata.totalPages).toBe(3);

        done();
      });
  });
});

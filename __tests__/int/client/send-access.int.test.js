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

let testClient = {};

beforeEach(async () => {
  await ClientModel.deleteMany();
  testClient = await ClientModel.create({
    name: 'test-name',
    email: 'test-email@test.com'
  });
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await mongoose.connection.close();
});

describe('POST /clients/send-access/:id', () => {
  const correctToken = jwt.sign(
    { login: config.admin.login, role: 'admin' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  it('should responde with status 401', done => {
    request(app)
      .put('/clients/send-access/' + testClient._id)
      .expect(401, done);
  });

  it('should responde with status 404', done => {
    request(app)
      .put('/clients/send-access/' + String(testClient._id).slice(1) + '5')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(404, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .put('/clients/send-access/' + testClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success } = res.body;
        const updatedClient = await ClientModel.findById(testClient._id);

        expect(success).toBe(true);
        expect(testClient.password).not.toBe(updatedClient.password);

        done();
      });
  });
});

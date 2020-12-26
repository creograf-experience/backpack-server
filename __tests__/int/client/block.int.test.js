const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const ClientModel = require('../../../src/components/client/model');
const AuthTokenModel = require('../../../src/components/auth-token/model');
const jwt = require('jsonwebtoken');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let testClient;

beforeEach(async () => {
  await ClientModel.deleteMany();
  await AuthTokenModel.deleteMany();

  testClient = await ClientModel.create({
    name: 'test-name',
    email: 'test@test.com'
  });

  await AuthTokenModel.create({
    value: '123',
    client: testClient._id
  });
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await AuthTokenModel.deleteMany();
  await mongoose.connection.close();
});

describe('PUT /clients/block/:id', () => {
  const correctToken = jwt.sign(
    { login: config.admin.login, role: 'admin' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  it('should responde with status 401', done => {
    request(app)
      .put('/clients/block/' + testClient._id)
      .expect(401, done);
  });

  it('should responde with status 404', done => {
    request(app)
      .put('/clients/block/' + String(testClient._id).slice(1) + '5')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(404, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .put('/clients/block/' + testClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success } = res.body;
        const updatedClient = await ClientModel.findById(testClient._id);
        const authtokens = await AuthTokenModel.find({ client: testClient._id });

        expect(success).toBe(true);
        expect(testClient.isBlocked).toBe(false);
        expect(updatedClient.isBlocked).toBe(true);
        expect(authtokens.length).toBe(0);

        done();
      });
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const { PasswordEncrypter } = require('../../../src/lib');
const app = require('../../../src/index');
const ClientModel = require('../../../src/components/client/model');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let validClient;
let invalidClient;

beforeAll(async () => {
  [validClient, invalidClient] = await Promise.all([
    ClientModel.create({
      name: 'test-name',
      email: 'test@email.com',
      password: await PasswordEncrypter.encrypt('123456'),
      resetPasswordToken: '123',
      resetPasswordTokenExpireDate: Date.now() + 24 * 60 * 60 * 1000
    }),
    ClientModel.create({
      name: 'test-name',
      email: 'test1@email.com',
      password: await PasswordEncrypter.encrypt('123456'),
      resetPasswordToken: '123',
      resetPasswordTokenExpireDate: Date.now() - 24 * 60 * 60 * 1000
    }),
  ]);
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await mongoose.connection.close();
});

describe('GET /reset-password/:clientId/:token', () => {
  const requestUrl = '/reset-password/';

  it('should responde with status 404 client not found', done => {
    request(app)
      .get(requestUrl + `${String(validClient._id).slice(1) + 5}/${validClient.resetPasswordToken}`)
      .expect(404, done);
  });

  it('should responde with status 400 wrong token', done => {
    request(app)
      .get(requestUrl + `${validClient._id}/321`)
      .expect(400, done);
  });

  it('should responde with status 400 expired token', done => {
    request(app)
      .get(requestUrl + `${invalidClient._id}/${invalidClient.resetPasswordToken}`)
      .expect(400, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .get(requestUrl + `${validClient._id}/${validClient.resetPasswordToken}`)
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const client = await ClientModel.findById(validClient._id);

        expect(client.password).not.toBe(validClient.password);
        expect(client.resetPasswordToken).toBe("");
        expect(client.resetPasswordTokenExpireDate).toBe(0);

        done();
      });
  });

  // it('should responde with status 404 wrong email', done => {
  //   request(app)
  //     .post(requestUrl)
  //     .send({ email: 'test1@email.com' })
  //     .expect(404, done);
  // });

  // it('should responde with status 200', done => {
  //   request(app)
  //     .post(requestUrl)
  //     .send({ email: 'test@email.com' })
  //     .expect(200)
  //     .end(async (err, res) => {
  //       if (err) return done(err);

  //       const { success } = res.body;
  //       const client = await ClientModel.findOne({ email: 'test@email.com' })

  //       expect(success).toBe(true);
  //       expect(client.resetPasswordToken).toBeTruthy();
  //       expect(client.resetPasswordTokenExpireDate).toBeTruthy();

  //       done();
  //     });
  // });
});

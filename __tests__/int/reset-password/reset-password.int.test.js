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

let newClient;

beforeAll(async () => {
  newClient = await ClientModel.create({
    name: 'test-name',
    email: 'test@email.com',
    password: await PasswordEncrypter.encrypt('123456')
  });
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await mongoose.connection.close();
});

describe('POST /reset-password', () => {
  const requestUrl = '/reset-password';

  it('should responde with status 400 no body', done => {
    request(app)
      .post(requestUrl)
      .expect(400, done);
  });

  it('should responde with status 400 no email', done => {
    request(app)
      .post(requestUrl)
      .send({ email: '' })
      .expect(400, done);
  });

  it('should responde with status 404 wrong email', done => {
    request(app)
      .post(requestUrl)
      .send({ email: 'test1@email.com' })
      .expect(404, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .post(requestUrl)
      .send({ email: 'test@email.com' })
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success } = res.body;
        const client = await ClientModel.findOne({ email: 'test@email.com' })

        expect(success).toBe(true);
        expect(client.resetPasswordToken).toBeTruthy();
        expect(client.resetPasswordTokenExpireDate).toBeTruthy();

        done();
      });
  });
});

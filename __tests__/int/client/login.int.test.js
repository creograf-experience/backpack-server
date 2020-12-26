const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const { PasswordEncrypter } = require('../../../src/lib');
const app = require('../../../src/index');
const ClientModel = require('../../../src/components/client/model');
const AuthTokenModel = require('../../../src/components/auth-token/model');

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let newClient;

beforeEach(async () => {
  await ClientModel.deleteMany();

  newClient = await ClientModel.create({
    name: 'test-name',
    email: 'test@email.com',
    password: await PasswordEncrypter.encrypt('123456')
  });
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await AuthTokenModel.deleteMany();
  await mongoose.connection.close();
});

describe('POST /clients/login', () => {
  const requestUrl = '/clients/login';

  it('should responde with status 400 no body', done => {
    request(app)
      .post(requestUrl)
      .expect(400, done);
  });

  it('should responde with status 400 no email', done => {
    request(app)
      .post(requestUrl)
      .send({ email: '', password: '123' })
      .expect(400, done);
  });

  it('should responde with status 400 no password', done => {
    request(app)
      .post(requestUrl)
      .send({ email: 'test-email', password: '' })
      .expect(400, done);
  });

  it('should responde with status 404 wrong email', done => {
    request(app)
      .post(requestUrl)
      .send({ email: 'test1@email.com', password: '123' })
      .expect(404, done);
  });

  it('should responde with status 400 wrong password', done => {
    request(app)
      .post(requestUrl)
      .send({ email: 'test@email.com', password: '1234' })
      .expect(400, done);
  });

  it('should responde with status 400 user is blocked', async done => {
    newClient.isBlocked = true;
    await newClient.save();

    request(app)
      .post(requestUrl)
      .send({ email: 'test@email.com', password: '123456' })
      .expect(400, done);
  });

  it('should responde with status 400 user is deleted', async done => {
    newClient.isDeleted = true;
    await newClient.save();

    request(app)
      .post(requestUrl)
      .send({ email: 'test@email.com', password: '123456' })
      .expect(400, done);
  });

  it('should responde with status 200', done => {
    request(app)
      .post(requestUrl)
      .send({ email: 'test@email.com', password: '123456' })
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const authtoken = await AuthTokenModel.findOne({ value: data.token });

        expect(success).toBe(true);
        expect(data.token).toBeTruthy();
        expect(authtoken).toBeTruthy();

        done();
      });
  });
});

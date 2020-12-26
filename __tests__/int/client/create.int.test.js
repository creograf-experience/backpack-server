const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../../../src/config');
const app = require('../../../src/index');
const ClientModel = require('../../../src/components/client/model');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

beforeEach(async () => {
  await ClientModel.deleteMany();
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await mongoose.connection.close();
});

describe('POST /clients', () => {
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

  it('should responde with status 401', done => {
    request(app)
      .post('/clients')
      .expect(401, done);
  });

  it('should responde with status 401', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401', done => {
    request(app)
      .post('/clients')
      .set('Authorization', wrongToken)
      .expect(401, done);
  });

  it('should responde with status 401', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + wrongRoleToken)
      .expect(401, done);
  });

  it('should responde with status 400', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(400, done);
  });

  it('should responde with status 400', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .send('name=&email=')
      .expect(400, done);
  });

  it('should responde with status 400 wrong email', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .send('name=name&email=wrong-email')
      .expect(400, done);
  });

  it('should responde with status 400 unique email', async done => {
    await ClientModel.create({
      name: 'test-name',
      email: 'test@test.com'
    });

    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .send('name=name&email=test@test.com')
      .expect(400, done);
  });

  it('should responde with status 400 unique email case sensetive', async done => {
    await ClientModel.create({
      name: 'test-name',
      email: 'test@test.com'
    });

    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .send('name=name&email=Test@test.com')
      .expect(400, done);
  });

  it('should responde with status 400 wrong file ext', async done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', 'test@test.com')
      .attach('logo', '__tests__/fixtures/avatar.txt')
      .attach('agencyLogo', '__tests__/fixtures/avatar.png')
      .expect(400, done);
  });

  it('should responde with status 400 wrong file ext', async done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', 'test@test.com')
      .attach('logo', '__tests__/fixtures/avatar')
      .expect(400, done);
  });

  it('should responde with status 200 with files', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .attach('logo', '__tests__/fixtures/avatar.png')
      .attach('agencyLogo', '__tests__/fixtures/avatar.png')
      .field('agencyName', 'test-agency-name')
      .field('name', 'test-name')
      .field('email', 'correct@email.com')
      .field('legalEntity', 'test-l-e')
      .field('description', 'test-descr')
      .field('INN', 'test-INN')
      .field('contactName', 'test-contact-name')
      .field('phone', 'test-phone')
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { client } = data;

        expect(success).toBe(true);
        expect(client._id).toBeTruthy();
        expect(client.agency.logo).toBeTruthy();
        expect(client.agency.name).toBeTruthy();
        expect(client.logo).toBeTruthy();

        await Promise.all([
          client.agency.logo && fs.unlink(config.imagesFolderPath + '/' + client.agency.logo),
          client.logo && fs.unlink(config.imagesFolderPath + '/' + client.logo)
        ]);

        done();
      });
  });

  it('should responde with status 200 without files', done => {
    request(app)
      .post('/clients')
      .set('Authorization', 'Bearer ' + correctToken)
      .field('agencyName', 'test-agency-name')
      .field('name', 'test-name')
      .field('email', 'correct@email.com')
      .field('legalEntity', 'test-l-e')
      .field('description', 'test-descr')
      .field('INN', 'test-INN')
      .field('contactName', 'test-contact-name')
      .field('phone', 'test-phone')
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { client } = data;

        expect(success).toBe(true);
        expect(client._id).toBeTruthy();
        expect(client.agency.name).toBeTruthy();
        expect(client.email).toBeTruthy();
        expect(client.name).toBeTruthy();
        expect(client.legalEntity).toBeTruthy();
        expect(client.description).toBeTruthy();
        expect(client.INN).toBeTruthy();
        expect(client.contactName).toBeTruthy();
        expect(client.phone).toBeTruthy();

        await Promise.all([
          client.agency.logo && fs.unlink(config.imagesFolderPath + '/' + client.agency.logo),
          client.logo && fs.unlink(config.imagesFolderPath + '/' + client.logo)
        ]);

        done();
      });
  });
});

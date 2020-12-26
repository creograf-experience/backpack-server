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

let newClient = {};

beforeEach(async () => {
  await ClientModel.deleteMany();
  newClient = await ClientModel.create({
    name: 'test-name',
    email: 'test@email.com',
    logo: 'avatar.png',
    agency: { logo: 'avatar-agency.png' }
  });
});

afterAll(async () => {
  await ClientModel.deleteMany();
  await mongoose.connection.close();
});

describe('PUT /clients/:id', () => {
  const correctToken = jwt.sign(
    { login: config.admin.login, role: 'admin' },
    config.jwtSecret,
    { expiresIn: '30s' }
  );

  it('should responde with status 401', done => {
    request(app)
      .put('/clients/' + newClient._id)
      .expect(401, done);
  });

  it('should responde with status 404 client does not exist', done => {
    request(app)
      .put('/clients/' + String(newClient._id).slice(1) + '5')
      .set('Authorization', 'Bearer ' + correctToken)
      .set('Content-type', 'multipart/form-data')
      .expect(404, done);
  });

  it('should responde with status 400', done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .expect(400, done);
  });

  it('should responde with status 400', done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .send('name=&email=')
      .expect(400, done);
  });

  it('should responde with status 400 wrong email', done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .send('name=name&email=wrong-email')
      .expect(400, done);
  });

  it('should responde with status 400 wrong file ext', async done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', newClient.email)
      .attach('logo', '__tests__/fixtures/avatar.txt')
      .attach('agencyLogo', '__tests__/fixtures/avatar.png')
      .expect(400, done);
  });

  it('should responde with status 400 wrong file ext', async done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', newClient.email)
      .attach('logo', '__tests__/fixtures/avatar')
      .expect(400, done);
  });

  it('should responde with status 400 if new email is taken', async done => {
    await ClientModel.create({
      name: 'test-name-2',
      email: 'test2@email.com'
    });

    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', 'test2@email.com')
      .expect(400, done);
  });

  it('should responde with status 400 if new email is taken casesensetive', async done => {
    await ClientModel.create({
      name: 'test-name-2',
      email: 'test2@email.com'
    });

    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', 'Test2@email.com')
      .expect(400, done);
  });

  it('should responde with status 200 ', async done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'name')
      .field('email', 'test2@email.com')
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { client } = data;

        expect(success).toBe(true);
        expect(client._id).toBe(String(newClient._id));
        expect(client.name).toBe('name');
        expect(client.name).not.toBe(newClient.name);
        expect(client.email).toBe('test2@email.com');
        expect(client.email).not.toBe(newClient.email);

        done();
      });
  });

  it('should responde with status 200 without files', done => {
    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('agencyName', 'test-agency-name')
      .field('name', 'test-name')
      .field('email', 'test@email.com')
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
        expect(client._id).toBe(String(newClient._id));
        expect(client.name).toBe('test-name');
        expect(client.email).toBe('test@email.com');
        expect(client.agency.name).toBe('test-agency-name');
        expect(client.legalEntity).toBe('test-l-e');
        expect(client.description).toBe('test-descr');
        expect(client.INN).toBe('test-INN');
        expect(client.contactName).toBe('test-contact-name');
        expect(client.phone).toBe('test-phone');

        done();
      });
  });

  it('should responde with status 200 with files', async done => {
    await Promise.all([
      fs.copyFile(`${config.rootPath}/__tests__/fixtures/avatar.png`, `${config.imagesFolderPath}/avatar.png`),
      fs.copyFile(`${config.rootPath}/__tests__/fixtures/avatar.png`, `${config.imagesFolderPath}/avatar-agency.png`),
    ]);

    request(app)
      .put('/clients/' + newClient._id)
      .set('Authorization', 'Bearer ' + correctToken)
      .field('name', 'test-name')
      .field('email', 'test@email.com')
      .attach('logo', '__tests__/fixtures/avatar.png')
      .attach('agencyLogo', '__tests__/fixtures/avatar.png')
      .expect(200)
      .end(async (err, res) => {
        if (err) return done(err);

        const { success, data } = res.body;
        const { client } = data;

        expect(success).toBe(true);
        expect(client._id).toBe(String(newClient._id));
        expect(client.agency.logo).not.toBe(newClient.agency.logo);
        expect(client.logo).not.toBe(newClient.logo);

        await Promise.all([
          client.agency.logo && fs.unlink(config.imagesFolderPath + '/' + client.agency.logo),
          client.logo && fs.unlink(config.imagesFolderPath + '/' + client.logo)
        ]);

        done();
      });
  });
});

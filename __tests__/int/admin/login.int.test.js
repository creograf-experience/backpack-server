const request = require('supertest');
const config = require('../../../src/config');
const app = require('../../../src/index');

describe('POST /admin/login', () => {
  it('should responde with status 400 no credentials', done => {
    request(app)
      .post('/admin/login')
      .expect(400, done);
  });

  it('should responde with status 400 empty login', done => {
    request(app)
      .post('/admin/login')
      .send({ login: '', password: '123' })
      .expect(400, done);
  });

  it('should responde with status 400 empty password', done => {
    request(app)
      .post('/admin/login')
      .send({ login: 'test', password: '' })
      .expect(400, done);
  });

  it('should responde with status 400 wrong login', done => {
    request(app)
      .post('/admin/login')
      .send({ login: 'test', password: config.admin.password })
      .expect(400, done);
  });

  it('should responde with status 400 wrong password', done => {
    request(app)
      .post('/admin/login')
      .send({ login: config.admin.login, password: 'test' })
      .expect(400, done);
  });

  it('should responde with status 200 and return jwt', done => {
    request(app)
      .post('/admin/login')
      .send({ login: config.admin.login, password: config.admin.password })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const { success, data } = res.body;

        expect(success).toBe(true);
        expect(data.token).toBeDefined();

        done();
      });
  });
});

const server = require('../api/server');
const supertest = require('supertest');
const db = require('../database/dbConfig');

describe('auth-router.js', () => {
  // ADD A USER
  describe('POST to /api/auth/register', () => {
    beforeEach(async () => {
      await db('users').truncate();
    });

    it('should hash the password', () => {
      return supertest(server)
        .post('/api/auth/register')
        .send({ username: "Joe", password: "pass"})
        .then(res => {
          expect(res.body.data.password).not.toBe('Joe');
        })
    })

    it('should return a status 400 error if missing credentials', () => {
      return supertest(server)
        .post('/api/auth/register')
        .send({ username: "", password: "pass"})
        .then(res => {
          expect(res.status).toBe(400);
        })
    })

    it('should register a new user', () => {
      return supertest(server)
        .post('/api/auth/register')
        .send({ username: "Joe", password: "pass" })
        .then(res => {
          expect(res.status).toBe(201);
        })
    })

    it('should return a newly created user', () => {
      return supertest(server)
        .post('/api/auth/register')
        .send({ username: "Joe", password: "pass"})
        .then(res => {
          expect(res.body.data.username).toBe('Joe');
        })
    })
  })

  // LOG IN A USER
  describe('POST to /api/auth/login', () => {
    it('should log in a user with credentials', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "Joe", password: "pass" })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.message).toBe('Welcome to the API, Joe');
        })
    })

    it('should return a JSON token upon successful login', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "Joe", password: "pass" })
        .then(res => {
          expect(res.body.token).toBeTruthy();
        })
    })

    it('should not login if the user credentials are invalid' ,() => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "joe", password: "passs"})
        .then(res => {
          expect(res.status).toBe(401);
          expect(res.body.message).toBe("Invalid credentials")
        })
    })

    it('should return a status 500 if missing credentials', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "", password: "pass"})
        .then(res => {
          expect(res.status).toBe(500);
        })
    })
  })

  // GET JOKES
  describe('GET to /api/jokes', () => {
    let token;

    it('should return a success status code', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "Joe", password: "pass"})
        .then(res => {
          token = res.body.token;
          return supertest(server)
            .get('/api/jokes')
            .set('Authorization', token)
            .then(res => {
              expect(res.status).toBe(200);
            })
        })
    })

    it('should get a list of jokes', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "Joe", password: "pass"})
        .then(res => {
          token = res.body.token;
          return supertest(server)
            .get('/api/jokes')
            .set('Authorization', token)
            .then(res => {
              expect(res.body).toHaveLength(20);
            })
        })
    })

    it('should not return jokes if not authorized', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "Joe", password: "pass"})
        .then(res => {
          return supertest(server)
            .get('/api/jokes')
            .then(res => {
              expect(res.status).toBe(403);
            })
        })
    })

    it('should return an error message for denied access', () => {
      return supertest(server)
        .post('/api/auth/login')
        .send({ username: "Joe", password: "pass"})
        .then(res => {
          return supertest(server)
            .get('/api/jokes')
            .then(res => {
              expect(res.body.message).toBe("You shall not pass!");
            })
        })
    })
  })
})
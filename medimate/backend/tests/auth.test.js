const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Clean up test database
    await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  });

  afterAll(async () => {
    await db.end();
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@123456',
          role: 'patient'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should not allow duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'Test@123456',
          role: 'patient'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123456'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
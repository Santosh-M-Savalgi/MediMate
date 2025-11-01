const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

describe('Appointment Endpoints', () => {
  let patientToken;
  let doctorToken;
  let appointmentId;

  beforeAll(async () => {
    // Create test users
    const patientRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'Test@123456',
        role: 'patient'
      });
    patientToken = patientRes.body.token;

    const doctorRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Doctor',
        email: 'doctor@test.com',
        password: 'Test@123456',
        role: 'doctor'
      });
    doctorToken = doctorRes.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM users WHERE email IN ($1, $2)', ['patient@test.com', 'doctor@test.com']);
    await db.end();
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctor_id: 2,
          appointment_date: '2025-12-01',
          appointment_time: '14:30',
          notes: 'Test appointment'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('appointment_id');
      appointmentId = res.body.appointment_id;
    });
  });

  describe('GET /api/appointments', () => {
    it('should get patient appointments', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get doctor appointments', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment status', async () => {
      const res = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          status: 'confirmed'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('confirmed');
    });
  });
});
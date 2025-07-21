import request from 'supertest';
import express from 'express';
import scrapeRouter from '../src/api/scrape.js';

// minimal app for testing
const app = express();
app.use(express.json());
app.use('/api/scrape', scrapeRouter);

describe('POST /api/scrape', () => {
  it('returns JSON array with the expected fields', async () => {
    const res = await request(app)
      .post('/api/scrape')
      .send({ market: 'kenya', filters: {} })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const item = res.body[0];
      expect(item).toHaveProperty('make');
      expect(item).toHaveProperty('model');
      expect(item).toHaveProperty('year');
      expect(item).toHaveProperty('priceKES');
      expect(item).toHaveProperty('totalCostKES');
    }
  });
});

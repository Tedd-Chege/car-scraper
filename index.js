// index.js (project root)
import express from 'express';
import dotenv from 'dotenv';
import scrapeRouter from './src/api/scrape.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 1️⃣ Apply JSON parsing on the app
app.use(express.json());

// 2️⃣ Health check
app.get('/', (req, res) => {
  res.send('Car Deal Comparator API is up and running!');
});

// 3️⃣ Mount the scrape router
app.use('/api/scrape', scrapeRouter);

// 404 & error handlers...
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});

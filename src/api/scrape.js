// src/api/scrape.js
import express from 'express';
import scrapeSite from '../scraper/genericScraper.js';
import { siteConfigs } from '../config/siteConfig.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { site, filters = {} } = req.body;

  // decide which sites to run
  const sitesToRun = site
    ? Array.isArray(site)
      ? site
      : [site]
    : Object.keys(siteConfigs);

  const results = {};
  const errors = {};

  await Promise.all(
    sitesToRun.map(async (key) => {
      if (!siteConfigs[key]) {
        errors[key] = `No config for site "${key}"`;
        return;
      }
      try {
        const data = await scrapeSite(key, filters);
        results[key] = data;
      } catch (e) {
        errors[key] = e.message;
      }
    })
  );

  // any successful scrapes?
  const succeeded = Object.keys(results).filter((k) => Array.isArray(results[k]));

  if (succeeded.length > 0) {
    return res.json({
      success: true,
      results
    });
  } else {
    return res.status(500).json({
      success: false,
      error: 'All scrapers failed',
      details: errors
    });
  }
});

export default router;

// src/scraper/genericScraper.js
import fs from 'fs';
import puppeteer from 'puppeteer';
import { siteConfigs } from '../config/siteConfig.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function genericScraper(siteKey, filters) {
  const cfg = siteConfigs[siteKey];
  if (!cfg) throw new Error(`No config for site "${siteKey}"`);

  console.log(`🔎 Scraping ${siteKey} — filters:`, filters);

  // ─── Detect a system Chrome (Debian/Ubuntu) ────────────────
  let executablePath;
  if (fs.existsSync('/usr/bin/chromium')) {
    executablePath = '/usr/bin/chromium';
  } else if (fs.existsSync('/usr/bin/chromium-browser')) {
    executablePath = '/usr/bin/chromium-browser';
  } else {
    console.log(`⚙️  No system Chrome detected, using Puppeteer’s bundled Chromium`);
  }

  // ─── Build launch options ──────────────────────────────────
  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(executablePath && { executablePath })
  };

  console.log('⚙️  Launch options:', launchOpts);
  const browser = await puppeteer.launch(launchOpts);
  const page    = await browser.newPage();

  // ─── Pagination loop ──────────────────────────────────────
  const firstPath = cfg.pathTemplate(filters);
  let pageNum     = 1;
  const seen      = new Map();

  while (pageNum <= cfg.maxPages) {
    const url = cfg.baseUrl +
      firstPath.replace(/(page[_]?number=|page=)\d+/, m => m.replace(/\d+/, pageNum));

    console.log(`→ [${siteKey} | Page ${pageNum}] loading ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      console.warn(`   ⚠️ [${siteKey} | Page ${pageNum}] navigation timed out, stopping.`);
      break;
    }

    await sleep(2000);
    const cards = await page.$$(cfg.cardSelector);
    console.log(`   ↳ found ${cards.length} card elements`);
    if (!cards.length) break;

    // log a sample price for debug
    const sampleRaw = await page.$$eval(
      `${cfg.cardSelector} ${cfg.fieldSelectors.price || ''}`,
      els => els[0]?.innerText.trim() || '<none>'
    );
    console.log(`   ↳ SAMPLE rawPrice/text: "${sampleRaw}"`);

    // extract all listings on this page
    const listings = await page.$$eval(
      cfg.cardSelector,
      (cards, selectors, base, site) => cards.map(card => {
        try {
          const rawTitle = card.querySelector(selectors.title)?.innerText.trim() || '';
          const parts    = rawTitle.split(' ');
          const year     = parseInt(parts[0], 10) || null;
          const make     = parts[1] || null;
          const model    = parts.slice(2).join(' ') || null;

          const rawPrice = card.querySelector(selectors.price)?.innerText || '';
          const priceKES = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || null;

          let href;
          if (site === 'jiji') {
            href = card.href;
          } else {
            href = card.querySelector(selectors.link)?.getAttribute('href') || '';
          }
          const detailsURL = href ? new URL(href, base).href : null;
          if (!detailsURL) return null;

          return { site, year, make, model, priceKES, detailsURL };
        } catch {
          return null;
        }
      }).filter(x => x),
      cfg.fieldSelectors,
      cfg.baseUrl,
      siteKey
    );

    console.log(`   ↳ page ${pageNum} → scraped ${listings.length} listings`);
    listings.forEach(l => seen.set(l.detailsURL, l));
    pageNum++;
  }

  await browser.close();
  console.log(`⭐️ [${siteKey}] Found ${seen.size} unique listings`);
  return Array.from(seen.values());
}

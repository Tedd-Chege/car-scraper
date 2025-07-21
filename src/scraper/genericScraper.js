// src/scraper/genericScraper.js
import puppeteer from 'puppeteer';
import { siteConfigs } from '../config/siteConfig.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function genericScraper(siteKey, filters) {
  const cfg = siteConfigs[siteKey];
  if (!cfg) throw new Error(`No config for site "${siteKey}"`);

  console.log(`🔎 Scraping ${siteKey} — filters:`, filters);
  const browser = await puppeteer.launch({ headless: true });
  const page    = await browser.newPage();

  const firstPath = cfg.pathTemplate(filters);
  let pageNum     = 1;
  const seen      = new Map();

  while (pageNum <= cfg.maxPages) {
    const url = cfg.baseUrl + firstPath.replace(/(page[_]?number=|page=)\d+/, m => m.replace(/\d+/, pageNum));
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

    if (cards.length === 0) break;

    // debug sample
    const sampleRaw = await page.$$eval(
      `${cfg.cardSelector} ${cfg.fieldSelectors.price || ''}`,
      els => els[0]?.innerText.trim() || '<none>'
    );
    console.log(`   ↳ SAMPLE rawPrice/text: "${sampleRaw}"`);

    // extract listings
    const listings = await page.$$eval(
      cfg.cardSelector,
      (cards, selectors, base, site) => {
        return cards.map(card => {
          try {
            // parse title
            const rawTitle = card.querySelector(selectors.title)?.innerText.trim() || '';
            const parts = rawTitle.split(' ');
            const year = parseInt(parts[0], 10) || null;
            const make = parts[1] || null;
            const model = parts.slice(2).join(' ') || null;

            // parse price
            const rawPrice = card.querySelector(selectors.price)?.innerText || '';
            const priceKES = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || null;

            // link
            let href;
            if (site === 'jiji') {
              href = card.href;
            } else {
              href = card.querySelector(selectors.link)?.getAttribute('href') || '';
            }
            const detailsURL = href ? new URL(href, base).href : null;
            if (!detailsURL) return null;

            return { site, year, make, model, priceKES, detailsURL };
          } catch (_) {
            return null;
          }
        }).filter(x => x);
      },
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

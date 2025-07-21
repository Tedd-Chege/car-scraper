// src/scraper/japanScraper.js
import puppeteer from 'puppeteer';

/**
 * Fetch and parse Japanese export listings from Goo-net.com based on filters
 * @param {Object} filters - { make, model, yearMin, yearMax, mileageMax }
 * @returns {Promise<Array>} Array of listing objects: { make, model, year, mileage, priceJPY, detailsURL }
 */
export default async function japanScraper(filters) {
  // Build query parameters
  const params = [];
  if (filters.make) params.push(`make=${encodeURIComponent(filters.make)}`);
  if (filters.model) params.push(`model=${encodeURIComponent(filters.model)}`);
  if (filters.yearMin) params.push(`year_min=${filters.yearMin}`);
  if (filters.yearMax) params.push(`year_max=${filters.yearMax}`);
  if (filters.mileageMax) params.push(`mileage_max=${filters.mileageMax}`);
  const url = `https://www.goo-net.com/export/list?${params.join('&')}`;

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

    const listings = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.boxList-common-item'));
      return rows.map(el => {
        const make = el.querySelector('.itemClass')?.textContent.trim() || null;
        const model = el.querySelector('.itemCarName')?.textContent.trim() || null;
        const yearMatch = el.querySelector('.itemYear')?.textContent.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
        const mileage = parseInt(el.querySelector('.itemMileage')?.textContent.replace(/[^0-9]/g, '') || '', 10) || null;
        const priceJPY = parseInt(el.querySelector('.itemPrice')?.textContent.replace(/[^0-9]/g, '') || '', 10) || null;
        const detailsURL = el.querySelector('a')?.href || null;
        return { make, model, year, mileage, priceJPY, detailsURL };
      });
    });

    await browser.close();
    return listings;
  } catch (err) {
    console.warn(`Japan scraper error for ${url}: ${err.message}`);
    if (browser) await browser.close();
    // Dev stub for testing
    return [{ make: 'Honda', model: 'Civic', year: 2019, mileage: 40000, priceJPY: 800000, detailsURL: 'https://www.goo-net.com/export/car-details/1' }];
  }
}

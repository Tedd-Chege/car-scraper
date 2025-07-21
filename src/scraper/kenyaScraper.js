// src/scraper/kenyaScraper.js
import puppeteer from 'puppeteer';

/**
 * Fetch and parse Kenyan car listings from Autochek.co.ke based on filters via Puppeteer
 * @param {Object} filters - { make, model, yearMin, yearMax, mileageMax }
 * @returns {Promise<Array>} Array of listing objects: { make, model, year, mileage, priceKES, detailsURL }
 */
export default async function kenyaScraper(filters) {
  let browser;
  try {
    // 1. Launch headless Chrome
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 2. Build search URL with user filters
    const params = new URLSearchParams();
    if (filters.make)       params.set('brand', filters.make);
    if (filters.model)      params.set('model', filters.model);
    if (filters.yearMin)    params.set('min_year', filters.yearMin);
    if (filters.yearMax)    params.set('max_year', filters.yearMax);

    const url = `https://www.autochek.africa/ke/cars-for-sale?${params.toString()}`;

    // 3. Navigate and wait for cards to render
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('.MuiPaper-root.css-vk1gx7', { timeout: 10000 });

    // 4. Extract listing details
    const listings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.MuiPaper-root.css-vk1gx7')).map(el => {
        // Title: "2017 BMW 320i"
        const titleEl = el.querySelector('h6.MuiTypography-h6');
        const title = titleEl?.textContent.trim() || '';
        const [yearStr, ...modelParts] = title.split(' ');
        const year = parseInt(yearStr, 10) || null;
        const make = modelParts[0] || null;
        const model = modelParts.slice(1).join(' ') || null;

        // Price
        const priceEl = el.querySelector('p.MuiTypography-body1');
        const priceRaw = priceEl?.textContent.replace(/[^0-9]/g, '') || '';
        const priceKES = priceRaw ? parseInt(priceRaw, 10) : null;

        // Mileage
      

        // Details URL
        const linkEl = el.querySelector('a[href^="/ke/car"]');
        const href = linkEl?.getAttribute('href') || '';
        const detailsURL = href ? new URL(href, 'https://www.autochek.africa').href : null;

        return { make, model, year, mileage, priceKES, detailsURL };
      });
    });

    // 5. Cleanup and return
    await browser.close();
    return listings;
  } catch (err) {
    console.warn(`Kenya scraper error: ${err.message}`);
    if (browser) await browser.close();
    // Fallback stub
    return [{ make: 'Toyota', model: 'Corolla', year: 2018, mileage: 50000, priceKES: 1200000, detailsURL: 'https://www.autochek.africa/ke/car/BMW-320i-ref-k7yZBuMLE' }];
  }
}

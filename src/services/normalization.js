// src/services/normalization.js

/**
 * Normalize raw listings from different scrapers into a unified format.
 * @param {Array} rawListings - Array of objects from kenyaScraper or japanScraper
 * @param {String} source - 'kenya' or 'japan'
 * @returns {Array} Array of normalized listing objects
 */
export function normalizeListings(rawListings, source) {
  return rawListings.map(item => {
    // Base structure
    const normalized = {
      source,
      make: item.make || null,
      model: item.model || null,
      year: item.year || null,
      mileage: item.mileage || null,
      detailsURL: item.detailsURL || null,
    };

    // Price and currency
    if (source === 'kenya') {
      normalized.priceKES = item.priceKES || null;
      normalized.priceJPY = null;
    } else if (source === 'japan') {
      normalized.priceJPY = item.priceJPY || null;
      normalized.priceKES = null;
    }

    return normalized;
  });
}

/**
 * Merge listings from multiple sources and fill missing fields.
 * @param {Array} kenya - normalized Kenya listings
 * @param {Array} japan - normalized Japan listings
 * @returns {Array} unified listings array
 */
export function mergeSources(kenya, japan) {
  // Simply concatenate for now; can add deduplication logic by title or VIN later
  return [...kenya, ...japan];
}

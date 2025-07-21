// src/utils/urlBuilder.js
import { siteConfigs } from '../config/siteConfig.js';

export function buildSearchUrl(siteKey, filters) {
  const cfg = siteConfigs[siteKey];
  // for GET sites, prefer pathTemplate if defined
  if (cfg.type === 'get') {
    if (typeof cfg.pathTemplate === 'function') {
      return cfg.baseUrl + cfg.pathTemplate(filters);
    }
    const url = new URL(cfg.baseUrl);
    Object.entries(filters).forEach(([field, value]) => {
      if (value != null && cfg.params[field]) {
        url.searchParams.set(cfg.params[field], value);
      }
    });
    return url.toString();
  }
  // form sites just use baseUrl
  return cfg.baseUrl;
}
// src/config/siteConfig.js
export const siteConfigs = {
  autochek: {
    baseUrl: 'https://www.autochek.africa/ke/cars-for-sale',
    pathTemplate: filters => {
      let path = '';
      if (filters.make)  path += `/${encodeURIComponent(filters.make)}`;
      if (filters.model) path += `/${encodeURIComponent(filters.model)}`;
      return path + '?page_number=1';
    },
    maxPages: 5,
    cardSelector: '.MuiPaper-root.css-vk1gx7',
    fieldSelectors: {
      title: 'h6.MuiTypography-h6',
      price: 'p.css-1bztvjj',  // actual price element
      link:  'a[href^="/ke/car/"]',
    }
  },

  jiji: {
    baseUrl: 'https://jiji.co.ke/cars',
    pathTemplate: filters => {
      const params = new URLSearchParams();
      if (filters.make)  params.set('filter_attr_1_make', filters.make);
      if (filters.model) params.set('filter_attr_2_model', filters.model);
      params.set('page', 1);
      return `?${params.toString()}`;
    },
    maxPages: 5,
    cardSelector: 'a.qa-advert-list-item',
    fieldSelectors: {
      title: 'div.qa-advert-title',
      price: 'div.qa-advert-price',
      link:  null,  // card element itself
    }
  }
};

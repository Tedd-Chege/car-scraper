// src/services/costCalculator.js
export default {
  calculate({ basePriceKES }) {
    const shippingKES = parseFloat((150 * process.env.USD_TO_KES_RATE).toFixed(2));
    const dutyKES    = basePriceKES * 0.25;
    const vatKES     = (basePriceKES + dutyKES) * 0.16;
    const idfKES     = basePriceKES * 0.02;
    const rdlKES     = basePriceKES * 0.20;
    const totalCostKES = basePriceKES + shippingKES + dutyKES + vatKES + idfKES + rdlKES;

    return { shippingKES, dutyKES, vatKES, idfKES, rdlKES, totalCostKES };
  }
};

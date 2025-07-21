import costCalculator from '../src/services/costCalculator.js';

describe('costCalculator.calculate', () => {
  it('computes a correct cost breakdown', () => {
    const base = 1_000_000;           // KES
    const costs = costCalculator.calculate({ basePriceKES: base });
    // Sum all components minus base should equal shipping + duty + vat + idf + rdl
    expect(costs.totalCostKES).toBe(
      costs.shippingKES +
      base +
      costs.dutyKES +
      costs.vatKES +
      costs.idfKES +
      costs.rdlKES
    );
    // Spot-check one component
    expect(costs.dutyKES).toBeCloseTo(base * 0.25);
  });
});

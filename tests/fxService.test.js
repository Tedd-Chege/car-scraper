import fxService from '../src/services/fxService.js';

describe('fxService.getRate', () => {
  it('fetches and caches USD→KES rate', async () => {
    const rate1 = await fxService.getRate('USD', 'KES');
    expect(typeof rate1).toBe('number');
    // calling again should hit cache and return same value
    const rate2 = await fxService.getRate('USD', 'KES');
    expect(rate2).toBe(rate1);
  });
});

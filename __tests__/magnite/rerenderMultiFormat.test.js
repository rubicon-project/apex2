/* eslint-env jest, browser */

import rerenderMultiFormat from 'src/magnite/rerenderMultiFormat';

window.MagniteApex = {
  initApex: jest.fn()
};

let apexConfig;

beforeEach(() => {
  window.MagniteApex.initApex.mockClear();
  apexConfig = {
    magnite: {
      account: 1111,
      site: 2222,
      zone: 3333,
      size_id: 203,
      vastBaseUrl: 'http://magnite.test'
    }
  };
});

describe('src/multiFormat', () => {
  test('should re-render ad with size 203 when original size is 207', () => {
    apexConfig.isMobile = true;
    apexConfig.multiFormat = true;
    apexConfig.magnite.size_id = 207;
    window.MagniteApex.initialConfig = JSON.stringify(apexConfig);
    rerenderMultiFormat();
    const newConfig = {
      isMobile: true,
      multiFormat: false, // this flag should be set to false
      magnite: {
        account: 1111,
        site: 2222,
        zone: 3333,
        size_id: 203,
        vastBaseUrl: 'http://magnite.test'
      }
    };
    expect(window.MagniteApex.initApex).toHaveBeenCalledWith(newConfig);
  });
});

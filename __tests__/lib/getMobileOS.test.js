/* eslint-env jest,browser */
import getMobileOperatingSystem from 'src/lib/getMobileOS';

Object.defineProperties(window.navigator, {
  userAgent: {
    get () { return this.testUserAgent; }
  },
  vendor: {
    get () { return this.testVendor; }
  }
});

Object.defineProperties(window, {
  opera: {
    get () { return this.testOpera; }
  }
});

afterAll(() => {
  // delete window.navigator.userAgent;
  delete window.opera;
});

describe('getMobileOperatingSystem', () => {
  test(
    'get mobile OS',
    () => {
      // Detect Android OS
      window.navigator.testUserAgent = 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('Android');

      // Detect Windows Phone
      window.navigator.testUserAgent = 'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('Windows Phone');

      // Detect iPhone
      window.navigator.testUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_2_1 like Mac OS X) AppleWebKit/602.4.6 (KHTML, like Gecko) Version/10.0 Mobile/14D27 Safari/602.1'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('iOS');

      // Detect iPad
      window.navigator.testUserAgent = 'Mozilla/5.0 (iPad; CPU OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13F69 Safari/601.1'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('iOS');

      // Detect iPod
      window.navigator.testUserAgent = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 9_3_5 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13G36 Safari/601.1'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('iOS');

      // Detect other mobule OS
      window.navigator.testUserAgent = 'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.35+ (KHTML, like Gecko) Version/10.3.2.2876 Mobile Safari/537.35+'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('unknown');
    }
  );

  test(
    'get mobile OS - other browsers',
    () => {
      window.navigator.testUserAgent = null;
      window.navigator.testVendor = 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('Android');
    }
  );

  test(
    'get mobile OS - opera',
    () => {
      window.navigator.testUserAgent = null;
      window.navigator.testVendor = null;
      window.testOpera = 'Mozilla/5.0 (Linux; Android 7.0; SM-A310F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.36 OPR/42.7.2246.114996'; // eslint-disable-line max-len
      expect(getMobileOperatingSystem()).toBe('Android');
    }
  );
});

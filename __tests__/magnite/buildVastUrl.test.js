/* eslint-env browser,jest */
import buildVastUrl from 'src/magnite/buildVastUrl';
import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';
import ccpa from 'src/magnite/ccpa';

jest.mock('src/lib/debugger');

const mockReferrer = 'http://ref.magnite.test/';
const originalReferrer = window.document.referrer;

const mockLocation = 'http://magnite.test/';
const originalLocation = window.location;

const randomValue = 0.123456123456;
const mathObject = global.Math;

function mockRandom () {
  const mockMath = Object.create(global.Math);
  mockMath.random = () => randomValue;
  global.Math = mockMath;
}

function restoreRandom () {
  global.Math = mathObject;
}

let apexConfig;
beforeEach(() => {
  apexConfig = {
    width: 640,
    height: 360,
    magnite: {
      vastBaseUrl: 'http://magnite.test',
      vastQuery: 'legacy',
      vastQueryTypes: {
        legacy: '/legacy',
        vastFriendly: '/vastFriendly'
      }
    }
  };
  //
  Object.defineProperty(document, 'referrer', { value: mockReferrer, configurable: true });
  Object.defineProperty(window, 'location', { value: { href: mockLocation }, configurable: true });
  mockRandom();
});

afterEach(() => {
  Object.defineProperty(document, 'referrer', { value: originalReferrer });
  Object.defineProperty(window, 'location', { value: originalLocation });
  restoreRandom();
});

describe('src/buildVastUrl', () => {
  test(
    'should return null when provided incorrect configuration - missing all parameters',
    () => {
      expect(buildVastUrl(apexConfig)).toBe(null);
      expect(debug.warn).toHaveBeenCalledWith('magnite: incorrect configuration', apexConfig.magnite);
    }
  );

  test(
    'should return null when provided incorrect configuration - provided some parameters',
    () => {
      apexConfig.magnite.account_id = 123;
      expect(buildVastUrl(apexConfig)).toBe(null);
    }
  );

  test(
    'should return null when provided incorrect configuration - missing one parameter',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 123,
          size_id: 123
        }
      };
      expect(buildVastUrl(apexConfig)).toBe(null);
    }
  );

  test(
    'should return vast URL when all parameters are in place',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203
        }
      };
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'should return correct width and height for vertical video',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 207 // vertical video
        }
      };
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        `width=${window.innerWidth}`, // uses window.innerWidth instead of apexConfig.width
        `height=${window.innerHeight}`, // uses window.innerHeight instead of apexConfig.height
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'should return vast URL when adParams are set',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: {
            tk_param1: 'zzz'
          }
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        'tk_param1=zzz',
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'should return vast URL when adParams are set - URL-unsafe params',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: {
            tk_param1: 'a=b&c=d'
          }
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        'tk_param1=a%3Db%26c%3Dd',
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'should return vast URL when adParams are set - incorrect adParams',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: 'tk_apex: 1, tk_param1: a=b&c=d'
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'should return vast URL when adParams are set - ad params of Magnite ad engine',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: {
            'p_aso.video.ext.ad.api': 2,
            'p_window.w': 1920
          }
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        'p_aso.video.ext.ad.api=2',
        'p_window.w=1920',
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'should return vast URL with defined query type',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          vastQuery: 'vastFriendly'
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'can override referrer',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: {
            rf: 'https://ref.magnite.test/'
          }
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(apexConfig.magnite.adParams.rf)}`,
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'cannot override p_window.url',
    () => {
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: {
            'p_window.url': 'https://ref.magnite.test/'
          }
        }
      };
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        `p_window.url=${encodeURIComponent(mockLocation)}`, // can't override this
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        'rp_secure=0',
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
    }
  );

  test(
    'page loaded via secure protocol',
    () => {
      // save
      const oldhref = window.location.href;
      const oldprotocol = window.location.protocol;
      //
      apexConfig.magnite = {
        ...apexConfig.magnite,
        ...{
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203
        }
      };
      // set location to https
      window.location.href = 'https://magnite.test/';
      window.location.protocol = 'https:';
      //
      const queryString = [
        `rf=${encodeURIComponent(mockReferrer)}`,
        `width=${apexConfig.width}`,
        `height=${apexConfig.height}`,
        `account_id=${apexConfig.magnite.account_id}`,
        `site_id=${apexConfig.magnite.site_id}`,
        `zone_id=${apexConfig.magnite.zone_id}`,
        `size_id=${apexConfig.magnite.size_id}`,
        `p_window.url=${encodeURIComponent('https://magnite.test/')}`,
        'rp_secure=1', // rp_secure is set to 1 when protocol is https
        'tk_apex=2',
        'cb=123456123456000000'
      ].join('&');
      const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
      expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
      // restore
      window.location.href = oldhref;
      window.location.protocol = oldprotocol;
    }
  );

  describe('GDPR', () => {
    test(
      'GDPR data from adParams have higher priority',
      () => {
        // set consent data
        const consentData = {
          gdpr: 0,
          gdpr_consent: 'XYZZY'
        };
        gdpr.setConsentData(consentData, 1);
        //
        apexConfig.magnite = {
          ...apexConfig.magnite,
          ...{
            account_id: 123,
            site_id: 456,
            zone_id: 789,
            size_id: 203,
            adParams: {
              gdpr: true,
              gdpr_consent: 'AAAAA'
            }
          }
        };
        //
        const queryString = [
          `rf=${encodeURIComponent(mockReferrer)}`,
          `gdpr=${apexConfig.magnite.adParams.gdpr}`,
          `gdpr_consent=${apexConfig.magnite.adParams.gdpr_consent}`,
          `width=${apexConfig.width}`,
          `height=${apexConfig.height}`,
          `account_id=${apexConfig.magnite.account_id}`,
          `site_id=${apexConfig.magnite.site_id}`,
          `zone_id=${apexConfig.magnite.zone_id}`,
          `size_id=${apexConfig.magnite.size_id}`,
          `p_window.url=${encodeURIComponent('http://magnite.test/')}`,
          'rp_secure=0',
          'tk_apex=2',
          'cb=123456123456000000'
        ].join('&');
        const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
        expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
        // restore
        gdpr.reset();
      }
    );
    test(
      'GDPR data from storage',
      () => {
        // set consent data
        const consentData = {
          gdpr: 1,
          gdpr_consent: 'XYZZY'
        };
        gdpr.setConsentData(consentData, 1);
        //
        apexConfig.magnite = {
          ...apexConfig.magnite,
          ...{
            account_id: 123,
            site_id: 456,
            zone_id: 789,
            size_id: 203
          }
        };
        //
        const queryString = [
          `rf=${encodeURIComponent(mockReferrer)}`,
          `gdpr=${gdpr.getGDPR().gdpr}`,
          `gdpr_consent=${gdpr.getGDPR().gdpr_consent}`,
          `width=${apexConfig.width}`,
          `height=${apexConfig.height}`,
          `account_id=${apexConfig.magnite.account_id}`,
          `site_id=${apexConfig.magnite.site_id}`,
          `zone_id=${apexConfig.magnite.zone_id}`,
          `size_id=${apexConfig.magnite.size_id}`,
          `p_window.url=${encodeURIComponent('http://magnite.test/')}`,
          'rp_secure=0',
          'tk_apex=2',
          'cb=123456123456000000'
        ].join('&');
        const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
        expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
        // restore
        gdpr.reset();
      }
    );
  });

  describe('CCPA', () => {
    test(
      'CCPA data from adParams have higher priority',
      () => {
        // set uspString data
        ccpa.uspString = '1YNN';
        //
        apexConfig.magnite = {
          ...apexConfig.magnite,
          ...{
            account_id: 123,
            site_id: 456,
            zone_id: 789,
            size_id: 203,
            adParams: {
              us_privacy: '2NNN'
            }
          }
        };
        //
        const queryString = [
          `rf=${encodeURIComponent(mockReferrer)}`,
          `us_privacy=${apexConfig.magnite.adParams.us_privacy}`,
          `width=${apexConfig.width}`,
          `height=${apexConfig.height}`,
          `account_id=${apexConfig.magnite.account_id}`,
          `site_id=${apexConfig.magnite.site_id}`,
          `zone_id=${apexConfig.magnite.zone_id}`,
          `size_id=${apexConfig.magnite.size_id}`,
          `p_window.url=${encodeURIComponent('http://magnite.test/')}`,
          'rp_secure=0',
          'tk_apex=2',
          'cb=123456123456000000'
        ].join('&');
        const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
        expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
      }
    );
    test(
      'CCPA data from storage',
      () => {
        // set consent data
        ccpa.uspString = '1YNN';
        //
        apexConfig.magnite = {
          ...apexConfig.magnite,
          ...{
            account_id: 123,
            site_id: 456,
            zone_id: 789,
            size_id: 203
          }
        };
        //
        const queryString = [
          `rf=${encodeURIComponent(mockReferrer)}`,
          `us_privacy=${ccpa.uspString}`,
          `width=${apexConfig.width}`,
          `height=${apexConfig.height}`,
          `account_id=${apexConfig.magnite.account_id}`,
          `site_id=${apexConfig.magnite.site_id}`,
          `zone_id=${apexConfig.magnite.zone_id}`,
          `size_id=${apexConfig.magnite.size_id}`,
          `p_window.url=${encodeURIComponent('http://magnite.test/')}`,
          'rp_secure=0',
          'tk_apex=2',
          'cb=123456123456000000'
        ].join('&');
        const query = apexConfig.magnite.vastQueryTypes[apexConfig.magnite.vastQuery];
        expect(buildVastUrl(apexConfig)).toBe(`${apexConfig.magnite.vastBaseUrl}${query}?${queryString}`);
      }
    );
  });
});

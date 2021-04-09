/* eslint-env jest, browser */

import isPlacementDisallowed from 'src/lib/allowplacement';

beforeEach(() => {
  // Clear JSDOM
  if (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});

describe('src/lib/allowplacement', () => {
  test(
    'should allow ad placement by default',
    () => {
      expect(isPlacementDisallowed({})).toBe(false);
    }
  );

  test(
    'should allow ad placement when includeAd element is present',
    () => {
      // setup
      const apexConfig = { includeAd: '#inc-ad' };
      const el = document.createElement('div');
      el.setAttribute('id', 'inc-ad');
      document.body.appendChild(el);
      // check
      expect(isPlacementDisallowed(apexConfig)).toBe(false);
    }
  );

  test(
    'should disallow ad placement when includeAd element is not present',
    () => {
      // setup
      const apexConfig = { includeAd: '#inc-ad' };
      // check
      expect(isPlacementDisallowed(apexConfig)).toBe(true);
    }
  );

  test(
    'should disallow ad placement when excludeAd element is present',
    () => {
      // setup
      const apexConfig = { excludeAd: '#exc-ad' };
      const el = document.createElement('div');
      el.setAttribute('id', 'exc-ad');
      document.body.appendChild(el);
      // check
      expect(isPlacementDisallowed(apexConfig)).toBe(true);
    }
  );

  test(
    'should allow ad placement when excludeAd element is not present',
    () => {
      // setup
      const apexConfig = { excludeAd: '#exc-ad' };
      // check
      expect(isPlacementDisallowed(apexConfig)).toBe(false);
    }
  );
});

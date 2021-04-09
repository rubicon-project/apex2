/* eslint-env browser,jest */
/* eslint-disable no-console */
import apex1compat, { getOptions, generateConfig } from 'src/magnite/apex1compat';
import deepMerge from 'src/lib/deepmerge';

global.console = {
  log: jest.fn(),
  warn: jest.fn()
};

window.MagniteApex = {
  renderAd: jest.fn()
};

beforeEach(() => {
  // Clear DOM
  if (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }

  console.log.mockClear();
  console.warn.mockClear();
  window.MagniteApex.renderAd.mockClear();
});

describe('src/magnite/apex1compat', () => {
  describe('getOptions', () => {
    const defaultConfig = {
      width: 640,
      height: 360,
      k_align: 'center',
      k_collapse: 1,
      k_multiFormat: 1,
      k_placement: 'a/top',
      k_pos: 'after'
    };

    test('empty options', () => {
      // prepare
      expect(console.warn).not.toHaveBeenCalled();
      // run
      const config = getOptions();
      // check
      expect(console.warn).toHaveBeenCalledWith('Missing or invalid JSON options object, will use default settings.');
      expect(console.warn).not.toHaveBeenCalledWith('Invalid options object, will use default settings.');
      expect(config).toEqual(defaultConfig);
    });

    test('invalid options array', () => {
      // prepare
      expect(console.warn).not.toHaveBeenCalled();
      // run
      const config = getOptions('["k_align: 1, k_collapse: 1"]');
      // check
      expect(console.warn).not.toHaveBeenCalledWith('Missing or invalid JSON options object, will use default settings.');
      expect(console.warn).toHaveBeenCalledWith('Invalid options object, will use default settings.');
      expect(config).toEqual(defaultConfig);
    });

    test('invalid options string', () => {
      // prepare
      expect(console.warn).not.toHaveBeenCalled();
      // run
      const config = getOptions('"k_align: 1, k_collapse: 1"');
      // check
      expect(console.warn).not.toHaveBeenCalledWith('Missing or invalid JSON options object, will use default settings.');
      expect(console.warn).toHaveBeenCalledWith('Invalid options object, will use default settings.');
      expect(config).toEqual(defaultConfig);
    });
  });

  describe('generateConfig', () => {
    const magniteIds = ['/123/4567/8901/234', 123, 4567, 8901, 234];
    const defaultApexConfig = {
      width: 640,
      height: 360,
      collapse: true,
      multiFormat: true,
      placement: [
        {
          attachTo: 'top',
          position: 'after',
          align: 'center'
        }
      ],
      magnite: {
        account_id: magniteIds[1],
        site_id: magniteIds[2],
        zone_id: magniteIds[3],
        size_id: magniteIds[4],
        adParams: {}
      }
    };

    test('empty options', () => {
      // run
      const apexConfig = generateConfig(magniteIds);
      // check
      expect(apexConfig).toEqual(defaultApexConfig);
    });

    test('full options set', () => {
      const apex1cfg = {
        width: 480,
        // -- height should come from default
        k_pos: 'before',
        k_placement: 'a/middle,g/p:nth-of-type(2),g/#OutStream',
        kw: 'keywords,list',
        k_align: 'left',
        k_label: 'Powered by Magnite',
        k_includeAd: '#divInclude',
        k_excludeAd: '#divExclude',
        k_logo: 1,
        k_audio: 'click',
        k_close: 1,
        k_adImp: 'http://magnite.test/track/impression',
        k_adClick: 'http://magnite.test/track/click',
        k_passback: 'passbackFunction',
        k_collapse: 0,
        k_fcap: 2,
        k_fhours: 1,
        k_multiFormat: 0
      };
      const options = JSON.stringify(apex1cfg);
      const expectedConfig = {
        width: apex1cfg.width,
        height: defaultApexConfig.height,
        collapse: apex1cfg.k_collapse === 1,
        multiFormat: apex1cfg.k_multiFormat === 1,
        passback: apex1cfg.k_passback,
        adClick: apex1cfg.k_adClick,
        adImpression: apex1cfg.k_adImp,
        includeAd: apex1cfg.k_includeAd,
        excludeAd: apex1cfg.k_excludeAd,
        label: apex1cfg.k_label,
        closeButton: apex1cfg.k_close === 1,
        placement: [
          {
            attachTo: 'middle',
            position: apex1cfg.k_pos,
            align: apex1cfg.k_align
          },
          {
            attachTo: 'p:nth-of-type(2)',
            position: apex1cfg.k_pos,
            align: apex1cfg.k_align
          },
          {
            attachTo: '#OutStream',
            position: apex1cfg.k_pos,
            align: apex1cfg.k_align
          }
        ],
        magnite: {
          account_id: magniteIds[1],
          site_id: magniteIds[2],
          zone_id: magniteIds[3],
          size_id: magniteIds[4],
          adParams: {
            kw: apex1cfg.kw
          }
        }
      };
      // run
      const apexConfig = generateConfig(magniteIds, options);
      // check
      expect(apexConfig).toEqual(expectedConfig);
    });
  });

  describe('apex1compat', () => {
    let mockScript;
    const scriptUrl = 'http://magnite.test/apex/321/7654/1098/432/apex.js';
    const defaultApexConfig = {
      width: 640,
      height: 360,
      collapse: true,
      multiFormat: true,
      placement: [
        {
          attachTo: 'top',
          position: 'after',
          align: 'center'
        }
      ],
      magnite: {
        account_id: 321,
        site_id: 7654,
        zone_id: 1098,
        size_id: 432,
        adParams: {}
      }
    };

    beforeAll(() => {
      Object.defineProperty(window.document, 'currentScript', {
        get: jest.fn(() => mockScript),
        set: jest.fn()
      });
    });

    beforeEach(() => {
      mockScript = null;
    });

    test('not an apex script', () => {
      mockScript = document.createElement('script');
      mockScript.src = 'http://localhost/apex.js';
      document.body.appendChild(mockScript);
      // run
      apex1compat();
      // check
      expect(console.log).not.toHaveBeenCalled();
      expect(window.MagniteApex.renderAd).not.toHaveBeenCalled();
    });

    test('apex script', () => {
      mockScript = document.createElement('script');
      mockScript.src = scriptUrl;
      document.body.appendChild(mockScript);
      // run
      apex1compat();
      // check
      expect(console.log).toHaveBeenCalledWith('Generated config for Apex2:', '\n', expect.any(String));
      expect(window.MagniteApex.renderAd).toHaveBeenCalledWith(defaultApexConfig);
    });

    test('apex script - IE', () => {
      const targetScript = document.createElement('script');
      targetScript.src = scriptUrl;
      document.body.appendChild(targetScript);
      // run
      apex1compat();
      // check
      expect(console.log).toHaveBeenCalledWith('Generated config for Apex2:', '\n', expect.any(String));
      expect(window.MagniteApex.renderAd).toHaveBeenCalledWith(defaultApexConfig);
      // restore
    });

    test('apex script with config', () => {
      mockScript = document.createElement('script');
      mockScript.src = scriptUrl;
      mockScript.textContent = '{"width":480,"height":200,"k_collapse":0}';
      document.body.appendChild(mockScript);
      const newConfig = deepMerge(defaultApexConfig, { width: 480, height: 200, collapse: false });
      // run
      apex1compat();
      // check
      expect(window.MagniteApex.renderAd).toHaveBeenCalledWith(newConfig);
    });
  });
});

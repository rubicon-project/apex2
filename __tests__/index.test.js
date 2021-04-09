/* eslint-env jest,browser */
import 'src/index';

import deepMerge from 'src/lib/deepmerge';
import debug from 'src/lib/debugger';
import nfbeacon from 'src/magnite/nfbeacon';
import buildVastUrl from 'src/magnite/buildVastUrl';
import PlayerSetup from 'src/playerSetup';
import PlayerController from 'src/player/jwplayer';
import isPlacementDisallowed from 'src/lib/allowplacement';
import getMobileOperatingSystem from 'src/lib/getMobileOS';
import { getPlacement } from 'src/playerPlacement';
import tcfv1 from 'src/magnite/gdpr/tcfv1';
import tcfv2 from 'src/magnite/gdpr/tcfv2';
import ccpa from 'src/magnite/ccpa';

import { defaultConfig } from 'src/config';

jest.mock('src/lib/debugger');
jest.mock('src/magnite/nfbeacon');
jest.mock('src/magnite/buildVastUrl');
jest.mock('src/playerSetup');
jest.mock('src/player/jwplayer');
jest.mock('src/lib/allowplacement');
jest.mock('src/lib/getMobileOS');
jest.mock('src/playerPlacement');
jest.mock('src/magnite/gdpr/tcfv1');
jest.mock('src/magnite/gdpr/tcfv2');
jest.mock('src/magnite/ccpa');
jest.mock('src/magnite/apex1compat');

const mathObject = global.Math;

function mockRandom (randomValue) {
  const mockMath = Object.create(global.Math);
  mockMath.random = () => randomValue;
  global.Math = mockMath;
}

function restoreRandom () {
  global.Math = mathObject;
}

const consoleObject = global.console;

function mockConsole () {
  global.console = {
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn()
  };
}

function restoreConsole () {
  global.console = consoleObject;
}

let playerControllerTestObj;
beforeEach(() => {
  playerControllerTestObj = null;
  getPlacement.mockReset();
  debug.log.mockClear();
  debug.warn.mockClear();
  debug.set.mockClear();
  nfbeacon.init.mockClear();
  nfbeacon.update.mockClear();
  buildVastUrl.mockReset();
  delete window.MagniteApex.initialConfig;

  isPlacementDisallowed.mockReset();
  isPlacementDisallowed.mockReturnValue(false);
  getMobileOperatingSystem.mockReset();
  getMobileOperatingSystem.mockReturnValue('unknown');

  PlayerSetup.setApexConfig.mockReset();
  PlayerSetup.setApexConfig.mockReturnValue(PlayerSetup);
  PlayerSetup.setRandomId.mockReset();
  PlayerSetup.setRandomId.mockReturnValue(PlayerSetup);
  PlayerSetup.setPlacement.mockReset();
  PlayerSetup.setPlacement.mockReturnValue(PlayerSetup);
  PlayerSetup.setPlayerController.mockReset();
  PlayerSetup.setPlayerController.mockImplementation((p) => {
    playerControllerTestObj = p;
    return PlayerSetup;
  });
  PlayerSetup.setupPlayerWrapper.mockReset();
  PlayerSetup.setupPlayerWrapper.mockReturnValue(PlayerSetup);
  PlayerSetup.setupPlayerIframe.mockReset();
  PlayerSetup.setupPlayerIframe.mockReturnValue(PlayerSetup);
  PlayerSetup.setupPlayerContainer.mockReset();
  PlayerSetup.setupPlayerContainer.mockReturnValue(PlayerSetup);
  PlayerSetup.attachPlayerToPage.mockReset();
  PlayerSetup.attachPlayerToPage.mockReturnValue(PlayerSetup);
  PlayerSetup.startPlayer.mockReset();
  PlayerSetup.startPlayer.mockReturnValue(PlayerSetup);

  PlayerController.isPresent.mockReset();
});

describe('src/index', () => {
  describe('playAd', () => {
    beforeEach(() => {
      mockRandom(999);
      mockConsole();
    });
    afterEach(() => {
      restoreRandom();
      restoreConsole();
    });

    test('invalid placement', () => {
      // setup
      const apexConfig = {
        magnite: {},
        placement: {
          attachTo: 'top',
          position: 'append',
          align: 'left'
        }
      };
      getPlacement.mockReturnValue(null);
      // run
      window.MagniteApex.playAd(apexConfig);
      // check
      expect(getPlacement).toHaveBeenCalledWith(apexConfig.placement);
      expect(console.warn).toHaveBeenCalledWith('Apex: no valid player placement found!'); // eslint-disable-line no-console
    });

    test('default placement', () => {
      // setup
      const apexConfig = {
        magnite: {},
        defaultPlacement: {
          attachTo: 'top',
          position: 'append',
          align: 'left'
        }
      };
      getPlacement.mockReturnValue(null);
      // run
      window.MagniteApex.playAd(apexConfig);
      // check
      expect(getPlacement).toHaveBeenCalledWith(apexConfig.defaultPlacement);
    });

    test('valid placement - no player instance available', () => {
      // setup
      const apexConfig = {
        magnite: {},
        placement: {
          attachTo: 'top',
          position: 'append',
          align: 'left'
        }
      };
      const adPlacement = {
        attachTo: 'top',
        position: 'append',
        align: 'left',
        node: 'targetNode'
      };
      getPlacement.mockReturnValue(adPlacement);
      PlayerController.isPresent.mockReturnValue(false); // player is not present
      // run
      window.MagniteApex.playAd(apexConfig);
      // check
      expect(getPlacement).toHaveBeenCalledWith(apexConfig.placement);
      expect(PlayerSetup.setApexConfig).toHaveBeenCalledWith(apexConfig);
      expect(PlayerSetup.setRandomId).toHaveBeenCalledWith(999);
      expect(PlayerSetup.setPlacement).toHaveBeenCalledWith(adPlacement);
      expect(PlayerSetup.setPlayerController).toHaveBeenCalled();
      expect(Object.getPrototypeOf(playerControllerTestObj)).toBe(PlayerController);
      expect(PlayerSetup.setupPlayerWrapper).toHaveBeenCalled();
      expect(PlayerController.isPresent).toHaveBeenCalledWith(window);
      expect(PlayerSetup.setupPlayerIframe).not.toHaveBeenCalled(); // no call
      expect(PlayerSetup.setupPlayerContainer).toHaveBeenCalled();
      expect(PlayerSetup.attachPlayerToPage).toHaveBeenCalled();
      expect(PlayerSetup.startPlayer).toHaveBeenCalled();
    });

    test('valid placement - player instance is present', () => {
      // setup
      const apexConfig = {
        magnite: {},
        placement: {
          attachTo: 'top',
          position: 'append',
          align: 'left'
        }
      };
      const adPlacement = {
        attachTo: 'top',
        position: 'append',
        align: 'left',
        node: 'targetNode'
      };
      getPlacement.mockReturnValue(adPlacement);
      PlayerController.isPresent.mockReturnValue(true); // player is present
      // run
      window.MagniteApex.playAd(apexConfig);
      // check
      expect(getPlacement).toHaveBeenCalledWith(apexConfig.placement);
      expect(PlayerSetup.setApexConfig).toHaveBeenCalledWith(apexConfig);
      expect(PlayerSetup.setRandomId).toHaveBeenCalledWith(999);
      expect(PlayerSetup.setPlacement).toHaveBeenCalledWith(adPlacement);
      expect(PlayerSetup.setPlayerController).toHaveBeenCalled();
      expect(Object.getPrototypeOf(playerControllerTestObj)).toBe(PlayerController);
      expect(PlayerSetup.setupPlayerWrapper).toHaveBeenCalled();
      expect(PlayerController.isPresent).toHaveBeenCalledWith(window);
      expect(PlayerSetup.setupPlayerIframe).toHaveBeenCalled();
      expect(PlayerSetup.setupPlayerContainer).not.toHaveBeenCalled(); // no call
      expect(PlayerSetup.attachPlayerToPage).toHaveBeenCalled();
      expect(PlayerSetup.startPlayer).not.toHaveBeenCalled(); // no call
    });

    test('vertical video on desktop should not start', () => {
      // setup
      const apexConfig = {
        magnite: {
          size_id: '207'
        },
        isMobile: false,
        placement: {
          attachTo: 'top',
          position: 'append',
          align: 'left'
        }
      };
      const adPlacement = {
        attachTo: 'top',
        position: 'append',
        align: 'left',
        node: 'targetNode'
      };
      getPlacement.mockReturnValue(adPlacement);
      // run
      window.MagniteApex.playAd(apexConfig);
      // check
      expect(getPlacement).toHaveBeenCalledWith(apexConfig.placement);
      expect(PlayerSetup.setApexConfig).not.toHaveBeenCalled();
      expect(PlayerSetup.startPlayer).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Apex: vertical video placement is supported on mobile platforms only'); // eslint-disable-line no-console
    });
  });

  describe('initApex', () => {
    let playAdMock;
    beforeEach(() => {
      global.APEX_VERSION = '2.0.0';
      playAdMock = jest.spyOn(window.MagniteApex, 'playAd').mockImplementation(() => true);
      mockConsole();
    });
    afterEach(() => {
      delete global.APEX_VERSION;
      playAdMock.mockRestore();
      restoreConsole();
    });

    test('default options', () => {
      // setup
      const config = {
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        vastUrl: 'http://example.test/vast.xml'
      };
      const apexConfig = deepMerge(defaultConfig, config);
      apexConfig.isMobile = false;
      // run
      window.MagniteApex.initApex(config);
      // check
      expect(console.info).toHaveBeenCalledWith('Magnite Apex', global.APEX_VERSION); // eslint-disable-line no-console
      expect(nfbeacon.init).toHaveBeenCalledWith(apexConfig.magnite, debug);
      expect(nfbeacon.update).toHaveBeenCalledWith('apex_loaded');
      expect(isPlacementDisallowed).toHaveBeenCalledWith(apexConfig);
      expect(getMobileOperatingSystem).toHaveBeenCalled();
      expect(buildVastUrl).not.toHaveBeenCalled();
      expect(playAdMock).toHaveBeenCalledWith(apexConfig);
    });

    test('isMobile', () => {
      // setup
      const config = {
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        vastUrl: 'http://example.test/vast.xml'
      };
      const apexConfig = deepMerge(defaultConfig, config);
      getMobileOperatingSystem.mockReturnValue('Android');
      apexConfig.isMobile = true;
      // run
      window.MagniteApex.initApex(config);
      // check
      expect(playAdMock).toHaveBeenCalledWith(apexConfig);
    });

    test('placement is disallowed', () => {
      // setup
      const config = {
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        vastUrl: 'http://example.test/vast.xml'
      };
      const apexConfig = deepMerge(defaultConfig, config);
      isPlacementDisallowed.mockReturnValue(true); // disallow placement
      // run
      window.MagniteApex.initApex(config);
      // check
      expect(isPlacementDisallowed).toHaveBeenCalledWith(apexConfig);
      expect(console.warn).toHaveBeenCalledWith('Apex: placement is not allowed by includeAd/excludeAd option'); // eslint-disable-line no-console
      expect(getMobileOperatingSystem).not.toHaveBeenCalled();
      expect(playAdMock).not.toHaveBeenCalled();
    });

    test('Magnite configuration', () => {
      // setup
      const config = {
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        magnite: {
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203
        }
      };
      const magniteVastUrl = 'http://magnite.test/vast.xml';
      const apexConfig = deepMerge(defaultConfig, config);
      apexConfig.vastUrl = magniteVastUrl;
      buildVastUrl.mockReturnValue(magniteVastUrl);
      apexConfig.isMobile = false;
      // run
      window.MagniteApex.initApex(config);
      // check
      expect(buildVastUrl).toHaveBeenCalledWith(apexConfig);
      expect(playAdMock).toHaveBeenCalledWith(apexConfig);
    });
  });

  describe('renderAd', () => {
    let initApexMock;
    beforeEach(() => {
      global.APEX_VERSION = '2.0.0';
      initApexMock = jest.spyOn(window.MagniteApex, 'initApex').mockImplementation(() => true);
      tcfv1.createConsentPromise.mockImplementation(() => Promise.resolve());
      tcfv2.createConsentPromise.mockImplementation(() => Promise.resolve());
      ccpa.createUspPromise.mockImplementation(() => Promise.resolve());
    });
    afterEach(() => {
      delete global.APEX_VERSION;
      initApexMock.mockRestore();
      tcfv1.createConsentPromise.mockRestore();
      tcfv2.createConsentPromise.mockRestore();
      ccpa.createUspPromise.mockRestore();
    });

    test('with adParams', async () => {
      // setup
      const config = {
        apexdebug: true,
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        magnite: {
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203,
          adParams: {
            gdpr: true,
            usp_consent: 'Y1NN'
          }
        }
      };
      expect(tcfv1.createConsentPromise).not.toHaveBeenCalled();
      expect(tcfv2.createConsentPromise).not.toHaveBeenCalled();
      expect(ccpa.createUspPromise).not.toHaveBeenCalled();
      expect(initApexMock).not.toHaveBeenCalled();
      // run
      await window.MagniteApex.renderAd(config);
      // check
      expect(debug.set).toHaveBeenCalledWith(true);
      expect(tcfv1.createConsentPromise).toHaveBeenCalledWith(config.magnite.adParams);
      expect(tcfv2.createConsentPromise).toHaveBeenCalledWith(config.magnite.adParams);
      expect(ccpa.createUspPromise).toHaveBeenCalledWith(config.magnite.adParams);
      expect(initApexMock).toHaveBeenCalledWith({ ...config, apexdebug: true });
    });

    test('without adParams', async () => {
      // setup
      const config = {
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        magnite: {
          account_id: 123,
          site_id: 456,
          zone_id: 789,
          size_id: 203
        }
      };
      expect(tcfv1.createConsentPromise).not.toHaveBeenCalled();
      expect(tcfv2.createConsentPromise).not.toHaveBeenCalled();
      expect(ccpa.createUspPromise).not.toHaveBeenCalled();
      expect(initApexMock).not.toHaveBeenCalled();
      // run
      await window.MagniteApex.renderAd(config);
      // check
      expect(debug.set).toHaveBeenCalledWith(false);
      expect(tcfv1.createConsentPromise).toHaveBeenCalledWith({});
      expect(tcfv2.createConsentPromise).toHaveBeenCalledWith({});
      expect(ccpa.createUspPromise).toHaveBeenCalledWith({});
      expect(initApexMock).toHaveBeenCalledWith({ ...config, apexdebug: false });
    });

    test('debug enabled', async () => {
      // setup
      const config = {
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        vastUrl: 'http://example.test/vast.xml'
      };
      window.location.hash = '#?apexdebug=1&apextest=1';
      // run
      await window.MagniteApex.renderAd(config);
      expect(initApexMock).toHaveBeenCalledWith({ ...config, apexdebug: true });
      // restore
      window.location.hash = null;
    });

    test('config is saved', async () => {
      // setup
      const config = {
        apexdebug: false,
        width: 320,
        height: 200,
        label: 'powered by Magnite',
        vastUrl: 'http://example.test/vast.xml'
      };
      // run
      expect(window.MagniteApex.initialConfig).not.toBeDefined();
      await window.MagniteApex.renderAd(config);
      expect(window.MagniteApex.initialConfig).toEqual(JSON.stringify(config));
    });
  });
});

/* eslint-env jest,browser */
import { createScriptElement } from 'src/lib/dom';
import { createPlayerWrapper, createPlayerContainer, createPlayerFrame, attachPlayer, getPlacement } from 'src/playerPlacement';
import PlayerSetup from 'src/playerSetup';
import VerticalVideo from 'src/verticalVideo';
import debug from 'src/lib/debugger';

jest.mock('src/lib/debugger');
jest.mock('src/lib/dom');
jest.mock('src/playerPlacement');
jest.useFakeTimers();

const playerConfig = {
  player: {
    attachTo: 'MagniteApexPlayer',
    jwplayer: {
      playerUrl: 'test'
    }
  },
  collapse: true,
  attachTo: '#target1',
  position: 'prepend',
  align: 'left',
  renderer: 'jwplayer',
  width: 640
};
const randomValue = 999;
const playerController = {};
let setup = {};

/** setup */
beforeEach(() => {
  setup = Object.create(PlayerSetup);
  debug.log.mockClear();
  return true;
});

afterEach(() => {
  setup = {};
});

describe('src/playerSetup', () => {
  beforeEach(() => {
    const adPlacement = {
      attachTo: 'top',
      position: 'append',
      align: 'left',
      node: 'targetNode'
    };
    const playerWrapper = document.createElement('div');
    playerWrapper.id = `MagniteApex-wrapper-${randomValue}`;
    createPlayerWrapper.mockReturnValue(playerWrapper);

    const playerContainer = document.createElement('div');
    playerContainer.id = `${playerConfig.player.attachTo}-${randomValue}`;
    createPlayerContainer.mockReturnValue(playerContainer);

    getPlacement.mockReturnValue(adPlacement);

    document.body.innerHTML = '<div id="article"><div id="target1"></div><div id="target2" class="d"></div><div id="target3" class="d"></div></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    getPlacement.mockClear();
    createPlayerWrapper.mockClear();
    createPlayerContainer.mockClear();
    createPlayerFrame.mockClear();
    attachPlayer.mockClear();
  });

  it('setApexConfig', () => {
    setup.setApexConfig(playerConfig);

    expect(setup.apexConfig).toEqual(playerConfig);
  });

  it('setPlacement', () => {
    const adPlacement = getPlacement(playerConfig);

    setup.setPlacement(adPlacement);

    expect(setup.position).toEqual(adPlacement.position);
    expect(setup.align).toEqual(adPlacement.align);
    expect(setup.node).toEqual(adPlacement.node);
  });

  it('setRandomId', () => {
    setup.setRandomId(randomValue);

    expect(setup.randomId).toEqual(randomValue);
  });

  it('setPlayerController', () => {
    setup.setPlayerController(playerController);

    expect(setup.playerController).toEqual(playerController);
  });

  it('setupPlayerWrapper', () => {
    setup.setApexConfig(playerConfig).setRandomId(randomValue).setupPlayerWrapper();

    expect(setup.apexConfig).toEqual(playerConfig);
    expect(setup.randomId).toEqual(randomValue);
    expect(setup.attachPlayerTo).toEqual(`${playerConfig.player.attachTo}-${randomValue}`);
    expect(createPlayerWrapper).toHaveBeenCalled();
    expect(setup.playerWrapper.outerHTML).toEqual(`<div id="MagniteApex-wrapper-${randomValue}"></div>`);
  });

  it('setupPlayerIframe', () => {
    const adPlacement = getPlacement(playerConfig);

    document.body.innerHTML = `<iframe id="MagniteApex-iframe-${randomValue}" srcdoc="<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body style="margin:0px;padding:0px;overflow:hidden"><div id="#target1-${randomValue}"></div></body></html>" />`;
    createPlayerFrame.mockReturnValue(document.getElementById(`MagniteApex-iframe-${randomValue}`));

    setup.setApexConfig(playerConfig)
      .setPlacement(adPlacement)
      .setRandomId(randomValue)
      .setupPlayerWrapper()
      .setupPlayerIframe();

    expect(createPlayerWrapper).toHaveBeenCalledWith(randomValue, 'left');
    expect(createPlayerFrame).toHaveBeenCalledWith(
      `${playerConfig.player.attachTo}-${randomValue}`,
      playerConfig.width,
      randomValue
    );
    expect(setup.apexConfig).toEqual(playerConfig);
    expect(setup.position).toEqual(adPlacement.position);
    expect(setup.align).toEqual(adPlacement.align);
    expect(setup.node).toEqual(adPlacement.node);
    expect(setup.randomId).toEqual(randomValue);
    expect(setup.attachPlayerTo).toEqual(`${playerConfig.player.attachTo}-${randomValue}`);
    expect(setup.playerWrapper.outerHTML).toEqual(`<div id="MagniteApex-wrapper-${randomValue}"></div>`);
    expect(setup.playerFrame.outerHTML).toEqual(`<iframe id="MagniteApex-iframe-${randomValue}" srcdoc="<!DOCTYPE html><html lang=" en"=""><head><meta charset="UTF-8"></head><body style="margin:0px;padding:0px;overflow:hidden"><div id="#target1-${randomValue}"></div></body></html>" /></iframe>`);
  });

  it('setupPlayerIframe - onload', () => {
    const adPlacement = getPlacement(playerConfig);

    document.body.innerHTML = `<iframe id="MagniteApex-iframe-${randomValue}" srcdoc="<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body style="margin:0px;padding:0px;overflow:hidden"><div id="#target1-${randomValue}"></div></body></html>" />`;
    createPlayerFrame.mockReturnValue(document.getElementById(`MagniteApex-iframe-${randomValue}`));
    setup.postAttach = jest.fn();

    // pre-check
    expect(setup.postAttach).not.toHaveBeenCalled();
    expect(playerController.iframeSizeWatch).not.toBeDefined();
    // run
    setup.setApexConfig(playerConfig)
      .setPlacement(adPlacement)
      .setRandomId(randomValue)
      .setPlayerController(playerController)
      .setupPlayerWrapper()
      .setupPlayerIframe();
    setup.playerFrame.onload();
    const playerFrame = createPlayerFrame();
    playerFrame.style.height = '0px';

    // check postAttach
    expect(setup.postAttach).toHaveBeenCalledTimes(1);
    expect(setup.postAttach).toHaveBeenCalledWith(
      playerFrame.contentWindow
    );
    expect(playerController.iframeSizeWatch).toBeDefined();
    // check frame resizer
    expect(setInterval).toHaveBeenCalledTimes(1);
    const scrollHeightSpy = jest
      .spyOn(playerFrame.contentWindow.document.documentElement, 'scrollHeight', 'get')
      .mockImplementation(() => 100);
    expect(playerFrame.style.height).toBe('0px');
    jest.runOnlyPendingTimers();
    expect(playerFrame.style.height).toBe('100px');
    jest.runOnlyPendingTimers();
    expect(playerFrame.style.height).toBe('100px');
    // restore
    delete setup.postAttach;
    scrollHeightSpy.mockRestore();
    delete playerController.iframeSizeWatch;
  });

  it('setupPlayerContainer', () => {
    const adPlacement = getPlacement(playerConfig);

    setup.setApexConfig(playerConfig)
      .setPlacement(adPlacement)
      .setRandomId(randomValue)
      .setupPlayerWrapper()
      .setupPlayerContainer();

    expect(createPlayerWrapper).toHaveBeenCalledWith(randomValue, 'left');
    expect(createPlayerContainer).toHaveBeenCalledWith(`${playerConfig.player.attachTo}-${randomValue}`, playerConfig.width);
    expect(setup.apexConfig).toEqual(playerConfig);
    expect(setup.position).toEqual(adPlacement.position);
    expect(setup.align).toEqual(adPlacement.align);
    expect(setup.node).toEqual(adPlacement.node);
    expect(setup.randomId).toEqual(randomValue);
    expect(setup.attachPlayerTo).toEqual(`${playerConfig.player.attachTo}-${randomValue}`);
    expect(setup.playerWrapper.outerHTML).toEqual(`<div id="MagniteApex-wrapper-${randomValue}"></div>`);
    expect(setup.playerFrame.outerHTML).toEqual(`<div id="${playerConfig.player.attachTo}-${randomValue}"></div>`);
  });

  describe('verticalVideo', () => {
    beforeEach(() => {
      const adPlacement = getPlacement(playerConfig);
      setup
        .setApexConfig(playerConfig)
        .setRandomId(randomValue)
        .setPlacement(adPlacement)
        .setPlayerController(playerController)
        .setupPlayerWrapper();

      playerConfig.isMobile = true;
      playerConfig.magnite = { size_id: 207 };
    });

    it('should be undefined', () => {
      playerConfig.magnite = { size_id: 999 };
      setup.setupVertical();
      expect(playerController.verticalVideo).toBeUndefined();
    });

    test('verticalVideo instance created', () => {
      setup.setupVertical();
      expect(playerController.verticalVideo).toBeInstanceOf(VerticalVideo);
    });

    it('should change apexConfig settings', () => {
      setup.setupVertical();
      expect(playerConfig.collapse).toEqual(false);
      expect(playerConfig.label).toEqual(false);
      expect(playerConfig.width).toEqual('100%');
      expect(playerConfig.player.jwplayer.aspectratio).toEqual('9:16');
    });

    it('should create playerWrapper in the end of body', () => {
      setup
        .setupPlayerIframe()
        .attachPlayerToPage();
      expect(document.body.lastChild).toEqual(setup.playerWrapper);
    });

    test('disabled verticalVideo', () => {
      playerController.verticalVideo = false;
      setup
        .setupPlayerIframe()
        .attachPlayerToPage();
      expect(attachPlayer).toHaveBeenCalledWith(setup.position, setup.node, setup.playerWrapper);
    });
  });

  it('attachPlayerToPage', () => {
    const adPlacement = getPlacement(playerConfig);

    document.body.append(createPlayerWrapper());
    // eslint-disable-next-line max-len
    attachPlayer.mockReturnValue(() => adPlacement.node.append(createPlayerWrapper()));

    setup.setApexConfig(playerConfig)
      .setPlacement(adPlacement)
      .setRandomId(randomValue)
      .setPlayerController(playerController)
      .setupPlayerWrapper()
      .setupPlayerContainer()
      .attachPlayerToPage();

    expect(createPlayerWrapper).toHaveBeenCalledWith(randomValue, 'left');
    expect(createPlayerContainer).toHaveBeenCalled();
    expect(attachPlayer).toHaveBeenCalled();
    expect(setup.apexConfig).toEqual(playerConfig);
    expect(setup.position).toEqual(adPlacement.position);
    expect(setup.align).toEqual(adPlacement.align);
    expect(setup.node).toEqual(adPlacement.node);
    expect(setup.randomId).toEqual(randomValue);
    expect(setup.attachPlayerTo).toEqual(`${playerConfig.player.attachTo}-${randomValue}`);
    expect(setup.playerWrapper.outerHTML).toEqual(`<div id="MagniteApex-wrapper-${randomValue}"><div id="${playerConfig.player.attachTo}-${randomValue}"></div></div>`);
    expect(setup.playerFrame.outerHTML).toEqual(`<div id="${playerConfig.player.attachTo}-${randomValue}"></div>`);
  });

  it('startPlayer', () => {
    const adPlacement = getPlacement(playerConfig);

    setup.setApexConfig(playerConfig)
      .setPlacement(adPlacement)
      .setRandomId(randomValue)
      .setupPlayerWrapper()
      .setupPlayerContainer()
      .startPlayer();

    expect(createPlayerWrapper).toHaveBeenCalledWith(randomValue, 'left');
    expect(createScriptElement).toHaveBeenCalled();
    expect(setup.apexConfig).toEqual(playerConfig);
    expect(setup.position).toEqual(adPlacement.position);
    expect(setup.align).toEqual(adPlacement.align);
    expect(setup.node).toEqual(adPlacement.node);
    expect(setup.randomId).toEqual(randomValue);
    expect(setup.attachPlayerTo).toEqual(`${playerConfig.player.attachTo}-${randomValue}`);
    expect(setup.playerWrapper.outerHTML).toEqual(`<div id="MagniteApex-wrapper-${randomValue}"></div>`);
    expect(setup.playerFrame.outerHTML).toEqual(`<div id="${playerConfig.player.attachTo}-${randomValue}"></div>`);
  });

  it('postAttach', () => {
    const adPlacement = getPlacement(playerConfig);

    playerController.init = jest.fn();
    createScriptElement.mockImplementation((doc, scriptUrl, callback) => callback());

    setup.setApexConfig(playerConfig)
      .setPlacement(adPlacement)
      .setRandomId(randomValue)
      .setPlayerController(playerController)
      .setupPlayerWrapper()
      .setupPlayerContainer()
      .postAttach(window);

    expect(debug.log).toHaveBeenCalledWith('Apex Config', playerConfig);
    expect(createPlayerWrapper).toHaveBeenCalledWith(randomValue, 'left');
    expect(createScriptElement).toHaveBeenCalled();
    expect(playerController.init).toHaveBeenCalled();
    expect(setup.apexConfig).toEqual(playerConfig);
    expect(setup.position).toEqual(adPlacement.position);
    expect(setup.align).toEqual(adPlacement.align);
    expect(setup.node).toEqual(adPlacement.node);
    expect(setup.randomId).toEqual(randomValue);
    expect(setup.playerController).toEqual(playerController);
    expect(setup.attachPlayerTo).toEqual(`${playerConfig.player.attachTo}-${randomValue}`);
    expect(setup.playerWrapper.outerHTML).toEqual(`<div id="MagniteApex-wrapper-${randomValue}"></div>`);
    expect(setup.playerFrame.outerHTML).toEqual(`<div id="${playerConfig.player.attachTo}-${randomValue}"></div>`);
    createScriptElement.mockRestore();
  });
});

/* eslint-env jest, browser */
import JWPlayerController from 'src/player/jwplayer';

import handleEventAll from 'src/player/jwplayer/eventListeners/all';
import handleAdImpression from 'src/player/jwplayer/eventListeners/adImpression';
import handleAdClick from 'src/player/jwplayer/eventListeners/adClick';
import handleAdError from 'src/player/jwplayer/eventListeners/adError';

jest.mock('src/player/jwplayer/eventListeners/all');
jest.mock('src/player/jwplayer/eventListeners/adImpression');
jest.mock('src/player/jwplayer/eventListeners/adClick');
jest.mock('src/player/jwplayer/eventListeners/adError');

let apexConfig;
let wrapper;
let playerContainer;

jest.useFakeTimers();

describe('src/player/jwplayer', () => {
  let jwplayer;
  beforeEach(() => {
    apexConfig = {
      width: 640,
      height: 360,
      collapse: true,
      floating: true,
      isMobile: false,
      apexdebug: true,
      label: true,
      attachTo: 'MagniteApexPlayer-1',
      player: {
        jwplayer: {
          playerUrl: 'test',
          autostart: false,
          mute: true,
          width: 0,
          height: 0,
          advertising: {
            vpaidmode: 'insecure',
            vpaidcontrols: true,
            admessage: ' ',
            outstream: true,
            client: 'vast',
            autoplayadsmuted: true,
            endstate: 'close'
          }
        }
      }
    };
    window.jwplayer = jest.fn();
    wrapper = document.createElement('div');
    playerContainer = document.createElement('p');
    wrapper.appendChild(playerContainer);
    wrapper.firstChild.getBoundingClientRect = () => ({ width: apexConfig.width });

    jwplayer = jest.spyOn(window, 'jwplayer').mockImplementation(() => ({
      setup: jest.fn(),
      remove: jest.fn(),
      resize: jest.fn(),
      on: jest.fn((event, callback) => callback())
    }));
    jest.spyOn(playerContainer, 'remove');
    return true;
  });
  afterEach(() => {
    jwplayer.mockRestore();
    handleEventAll.mockClear();
    handleAdImpression.mockClear();
    handleAdClick.mockClear();
    handleAdError.mockClear();
    clearInterval.mockClear();
    return true;
  });
  describe('init', () => {
    it('should be inited with enabled properties collapse, floating, apexdebug and label', () => {
      JWPlayerController.iframeSizeWatch = 100;
      JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);

      expect(window.jwplayer).toHaveBeenCalledWith(apexConfig.attachTo);
      expect(JWPlayerController.jwplayer.setup).toHaveBeenCalledWith({
        advertising: {
          admessage: ' ',
          autoplayadsmuted: true,
          client: 'vast',
          endstate: 'close',
          outstream: true,
          tag: undefined,
          vpaidcontrols: true,
          vpaidmode: 'insecure'
        },
        autostart: false,
        displayHeading: true,
        floating: {
          dismissible: false,
          mode: 'notVisible'
        },
        height: 360,
        intl: {
          en: {
            advertising: {
              admessage: ' ',
              displayHeading: true
            }
          }
        },
        mute: true,
        width: 640
      });
      expect(JWPlayerController.jwplayer.resize).not.toHaveBeenCalled();
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('all', expect.any(Function));
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('adImpression', expect.any(Function));
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('adClick', expect.any(Function));
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('complete', expect.any(Function));
      jest.runOnlyPendingTimers();
      expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(1);
      expect(playerContainer.remove).toHaveBeenCalledTimes(1);
      jest.clearAllTimers();
      expect(clearInterval).toHaveBeenCalledWith(100);
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('adError', expect.any(Function));
    });

    it('should be inited with disabled properties collapse, floating, apexdebug and label', () => {
      apexConfig.collapse = false;
      apexConfig.floating = false;
      apexConfig.apexdebug = false;
      delete apexConfig.label;
      JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);

      expect(wrapper.outerHTML).toEqual('<div><p></p></div>');
      expect(window.jwplayer).toHaveBeenCalledWith(apexConfig.attachTo);
      expect(JWPlayerController.jwplayer.setup).toHaveBeenCalledWith({
        advertising: {
          admessage: ' ',
          autoplayadsmuted: true,
          client: 'vast',
          endstate: 'suspended',
          outstream: true,
          tag: undefined,
          vpaidcontrols: true,
          vpaidmode: 'insecure'
        },
        autostart: false,
        height: 360,
        intl: {
          en: {
            advertising: {
              admessage: ' '
            }
          }
        },
        mute: true,
        width: 640
      });
      expect(JWPlayerController.jwplayer.resize).not.toHaveBeenCalled();
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('adImpression', expect.any(Function));
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('adClick', expect.any(Function));
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('complete', expect.any(Function));
      jest.runOnlyPendingTimers();
      expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(1);
      expect(clearInterval).toHaveBeenCalledTimes(1);
      jest.clearAllTimers();
      expect(wrapper.outerHTML).toEqual('<div><div style="width:640px;height:360px"></div></div>');
      expect(JWPlayerController.jwplayer.on).toHaveBeenCalledWith('adError', expect.any(Function));

      JWPlayerController.iframeSizeWatch = null;
      JWPlayerController.remove();
      expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(2);
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should be resized when needed', () => {
      const w = 1600;
      const ratio = w / apexConfig.width;
      const h = apexConfig.height * ratio;
      wrapper.firstChild.getBoundingClientRect = () => ({ width: w });
      JWPlayerController.iframeSizeWatch = 100;
      JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);
      expect(JWPlayerController.jwplayer.resize).toHaveBeenCalledWith(
        w, h
      );
    });
  });

  it('should initialize vertical video', () => {
    apexConfig.isMobile = true;
    apexConfig.magnite = { size_id: 207 };
    JWPlayerController.verticalVideo = {
      initialize: jest.fn(),
      destroy: jest.fn()
    };
    JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);
    expect(JWPlayerController.verticalVideo.initialize).toHaveBeenCalledTimes(1);
    delete JWPlayerController.verticalVideo;
  });

  it('resize', () => {
    JWPlayerController.resize(300, 200);

    expect(JWPlayerController.jwplayer.resize).toHaveBeenCalledWith(300, 200);
  });

  it('isPresent', () => {
    expect(JWPlayerController.isPresent(window)).toBeTruthy();
  });

  it('should call passback callback function', () => {
    apexConfig.passback = 'testAdErrorCallback';
    window.testAdErrorCallback = jest.fn();
    JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);
    JWPlayerController.callPassback();
    expect(window.testAdErrorCallback).toHaveBeenCalledWith(wrapper);
    delete window.testAdErrorCallback;
  });

  it('should be removed', () => {
    wrapper.style.width = '640px';
    wrapper.style.height = '480px';
    wrapper.style.backgroundColor = '#000000';
    JWPlayerController.iframeSizeWatch = 100;
    JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);
    expect(wrapper.outerHTML).toEqual('<div style="width: 640px; height: 480px; background-color: rgb(0, 0, 0);"><p></p></div>');
    expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(0);

    JWPlayerController.remove();

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(1);
    expect(wrapper.outerHTML).toEqual('<div></div>'); // styles are cleared
  });

  it('should be removed (vertical video)', () => {
    wrapper.style.width = '640px';
    wrapper.style.height = '480px';
    wrapper.style.backgroundColor = '#000000';
    JWPlayerController.iframeSizeWatch = 100;
    apexConfig.isMobile = true;
    apexConfig.magnite = { size_id: 207 };
    JWPlayerController.verticalVideo = {
      initialize: jest.fn(),
      destroy: jest.fn()
    };
    JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);
    expect(wrapper.outerHTML).toEqual('<div style="width: 640px; height: 480px; background-color: rgb(0, 0, 0);"><p></p></div>');
    expect(JWPlayerController.verticalVideo.destroy).toHaveBeenCalledTimes(0);
    expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(0);

    JWPlayerController.remove();

    expect(JWPlayerController.verticalVideo.destroy).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(JWPlayerController.jwplayer.remove).toHaveBeenCalledTimes(1);
    expect(wrapper.outerHTML).toEqual('<div></div>'); // styles are cleared
  });

  it('placeholder should be placed when removed with collapse disabled', () => {
    apexConfig.collapse = false; // set collapse to false
    wrapper.style.width = '640px';
    wrapper.style.height = '480px';
    wrapper.style.backgroundColor = '#000000';
    JWPlayerController.init(wrapper, window, apexConfig, apexConfig.attachTo);
    expect(wrapper.outerHTML).toEqual('<div style="width: 640px; height: 480px; background-color: rgb(0, 0, 0);"><p></p></div>');
    JWPlayerController.remove();
    expect(wrapper.outerHTML).toEqual('<div><div style="width:640px;height:360px"></div></div>'); // placeholder is created
  });
});

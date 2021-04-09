/* eslint-env jest, browser */

// load module to be tested
import onAdError from 'src/player/jwplayer/eventListeners/adError';
import debug from 'src/lib/debugger';
import rerenderMultiFormat from 'src/magnite/rerenderMultiFormat';

jest.mock('src/magnite/rerenderMultiFormat');
// test-wide parameters
const error = {};
const JWPlayerController = {
  apexConfig: {},
  remove: jest.fn(),
  callPassback: jest.fn()
};

const mockDate = new Date(1466424490000);
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

window.testAdErrorCallback = jest.fn();

// ** setup
beforeAll(() => {
  debug.log = jest.fn();
  return true;
});

beforeEach(() => {
  rerenderMultiFormat.mockClear();
  debug.log.mockClear();
  JWPlayerController.apexConfig = {};
  return true;
});

describe('onAdError', () => {
  test('should call debug.log', () => {
    onAdError(JWPlayerController, error);
    expect(debug.log).toHaveBeenCalledWith(`Ad ERROR: ${mockDate.toISOString()}`, error);
  });

  test('should call passback callback', () => {
    onAdError(JWPlayerController, error);
    expect(JWPlayerController.callPassback).toHaveBeenCalled();
  });

  test('player removing', () => {
    onAdError(JWPlayerController, error);
    expect(JWPlayerController.remove).toHaveBeenCalled();
  });

  describe('rerenderMultiFormat', () => {
    test('all multiformat options are set', () => {
      JWPlayerController.apexConfig.multiFormat = true;
      JWPlayerController.apexConfig.magnite = { size_id: 207 };
      JWPlayerController.apexConfig.isMobile = true;
      onAdError(JWPlayerController, error);
      expect(rerenderMultiFormat).toHaveBeenCalledWith(); // i.e. called with no parameters
    });

    test('magnite options are not set', () => {
      JWPlayerController.apexConfig.magnite = {};
      JWPlayerController.apexConfig.multiFormat = true;
      JWPlayerController.apexConfig.isMobile = true;
      onAdError(JWPlayerController, error);
      expect(rerenderMultiFormat).not.toHaveBeenCalled();
    });

    test('multiformat option is not set', () => {
      JWPlayerController.apexConfig.magnite = { size_id: 207 };
      JWPlayerController.apexConfig.multiFormat = false;
      onAdError(JWPlayerController, error);
      expect(rerenderMultiFormat).not.toHaveBeenCalled();
    });

    test('mobile option is not set', () => {
      JWPlayerController.apexConfig.magnite = { size_id: 207 };
      JWPlayerController.apexConfig.multiFormat = true;
      JWPlayerController.apexConfig.isMobile = false;
      onAdError(JWPlayerController, error);
      expect(rerenderMultiFormat).not.toHaveBeenCalled();
    });
  });
});

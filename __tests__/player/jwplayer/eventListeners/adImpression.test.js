/* eslint-env jest */
import adImpression from 'src/player/jwplayer/eventListeners/adImpression';
import { createImage } from 'src/lib/dom';
import debug from 'src/lib/debugger';
import createCloseButton from 'src/player/createCloseButton';

jest.mock('src/lib/dom');
jest.mock('src/player/createCloseButton');

// test-wide parameters
const ev = { creativetype: true };
const playerContainer = { jwplayerContainer: true };
const jwplayerController = {
  apexConfig: {
    adImpression: 'http://test.com',
    createCloseButton: true
  },
  jwplayer: {
    getContainer () {
      return playerContainer;
    }
  }
};

// ** setup
beforeAll(() => {
  debug.log = jest.fn();
  return true;
});

beforeEach(() => {
  debug.log.mockClear();
  createImage.mockClear();
  createCloseButton.mockClear();
  return true;
});

// ** run tests
describe('src/player/jwplayer/eventListeners/adImpression', () => {
  it(
    'should call debug',
    () => {
      adImpression(jwplayerController, ev);
      expect(debug.log).toHaveBeenCalled();
    }
  );

  it(
    'should call createCloseButton',
    () => {
      expect(createCloseButton).not.toHaveBeenCalled();
      adImpression(jwplayerController, ev);
      expect(createCloseButton).toHaveBeenCalledWith(
        playerContainer,
        jwplayerController.apexConfig,
        jwplayerController
      );
    }
  );

  it(
    'should accommodate the adImpression option',
    () => {
      adImpression(jwplayerController, ev);
      expect(createImage).toHaveBeenCalledWith(jwplayerController.apexConfig.adImpression);
    }
  );

  it(
    'should not create image when adImpression is not present',
    () => {
      delete jwplayerController.apexConfig.adImpression;
      adImpression(jwplayerController, ev);
      expect(createImage).not.toHaveBeenCalled();
    }
  );
});

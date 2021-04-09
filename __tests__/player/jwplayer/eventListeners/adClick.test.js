/* eslint-env jest */
import adClick from 'src/player/jwplayer/eventListeners/adClick';
import { createImage } from 'src/lib/dom';

jest.mock('src/lib/dom');

// test-wide parameters
const apexConfig = { adClick: 'test.gif' };

// ** setup
beforeEach(() => {
  createImage.mockClear();
  return true;
});

// ** run tests
describe('src/player/jwplayer/eventListeners/adClick', () => {
  it(
    'should create image',
    () => {
      adClick({ apexConfig });
      expect(createImage).toHaveBeenCalled();
      expect(createImage).toHaveBeenCalledWith(apexConfig.adClick);
    }
  );

  it(
    'should not create image when k_adClick is not present',
    () => {
      delete apexConfig.adClick;
      adClick({ apexConfig });
      expect(createImage).not.toHaveBeenCalled();
    }
  );
});

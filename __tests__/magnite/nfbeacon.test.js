/* eslint-env jest */
/* global Image */
import nfbeacon from 'src/magnite/nfbeacon';

let randomValue;
const mathObject = global.Math;

function mockRandom () {
  const mockMath = Object.create(global.Math);
  mockMath.random = () => randomValue;
  global.Math = mockMath;
}

function restoreRandom () {
  global.Math = mathObject;
}

const debug = {};

// test-wide parameters
const config = {
  account_id: '7780',
  site_id: '82814',
  zone_id: '670586',
  size_id: '203',
  stats_url: '//beacon-nf.rubiconproject.com/beacon/e/',
  stats_topic: 'fvdd.apx.pixel',
  _test_UUID: 'UUID'
};
const type = 'apex_loaded';

global.Image = function Image () {
  if (typeof Image.instance === 'object') {
    return Image.instance;
  }
  this.src = '';
  this.events = {
    load: jest.fn(),
    error: jest.fn()
  };
  this.addEventListener = function eventListener (ev, cb) {
    this.events[ev] = cb;
  };
  Image.instance = this;
  return this;
};

// ** setup
beforeAll(() => {
  debug.log = jest.fn();
  debug.isEnabled = jest.fn().mockReturnValue(true);
  Image.call({}); // init image instance before tests
  return true;
});

beforeEach(() => {
  Image.instance.src = '';
  Image.instance.events.load = jest.fn();
  Image.instance.events.error = jest.fn();
  debug.log.mockClear();
  randomValue = 1;
  mockRandom();
  return true;
});

afterEach(() => {
  restoreRandom();
});

describe('src/lib/nfbeacon', () => {
  it(
    'should display an error when stats url is not defined',
    () => {
      nfbeacon.init({}, debug);
      nfbeacon.update(type);
      expect(Image.instance.src).toBe('');
      expect(debug.log).toHaveBeenCalledWith('NFBeacon - Empty URL!');
    }
  );

  it(
    'should display an error when stats url is empty',
    () => {
      nfbeacon.init({ stats_url: '' }, debug);
      nfbeacon.update(type);
      expect(Image.instance.src).toBe('');
      expect(debug.log).toHaveBeenCalledWith('NFBeacon - Empty URL!');
    }
  );

  it('should create image and correct URL', () => {
    const fullURL = '//beacon-nf.rubiconproject.com/beacon/e/fvdd.apx.pixel/apex_loaded-UUID?account_id=7780&site_id=82814&zone_id=670586&size_id=203&event=apex_loaded'; // eslint-disable-line max-len
    nfbeacon.init(config, debug);
    nfbeacon.update(type);
    Image.instance.events.load();
    expect(Image.instance.src).toBe(fullURL);
    expect(debug.log).toHaveBeenCalledWith(`NFBeacon updated: ${fullURL}`);
  });

  it('should return exception when create image', () => {
    const fullURL = '//beacon-nf.rubiconproject.com/beacon/e/fvdd.apx.pixel/apex_loaded-UUID?account_id=7780&site_id=82814&zone_id=670586&size_id=203&event=apex_loaded'; // eslint-disable-line max-len
    const errorEvent = { error: 1 };
    nfbeacon.init(config, debug);
    nfbeacon.update(type);
    Image.instance.events.error(errorEvent);
    expect(debug.log).toHaveBeenCalledWith(`NFBeacon update failed: ${fullURL}:`, errorEvent);
  });

  it(
    'should not call debug if it is disabled',
    () => {
      debug.isEnabled.mockReturnValue(false);
      nfbeacon.init(config, debug);
      nfbeacon.update(type);
      Image.instance.events.load();
      expect(debug.log).not.toHaveBeenCalled();
    }
  );

  describe('sampling_rate', () => {
    it(
      'sampling rate is 100%',
      () => {
        const fullURL = '//beacon-nf.rubiconproject.com/beacon/e/fvdd.apx.pixel/apex_loaded-UUID?account_id=7780&site_id=82814&zone_id=670586&size_id=203&event=apex_loaded'; // eslint-disable-line max-len
        const srconfig = { ...config };
        srconfig.stats_sampling_rate = 100;
        nfbeacon.init(srconfig, debug);
        nfbeacon.update(type);
        Image.instance.events.load();
        expect(Image.instance.src).toBe(fullURL);
      }
    );

    it(
      'sampling rate is 50% - sampled, nfbeacon called',
      () => {
        const fullURL = '//beacon-nf.rubiconproject.com/beacon/e/fvdd.apx.pixel/apex_loaded-UUID?account_id=7780&site_id=82814&zone_id=670586&size_id=203&event=apex_loaded'; // eslint-disable-line max-len
        const srconfig = { ...config };
        srconfig.stats_sampling_rate = 50;
        randomValue = 0.1;
        nfbeacon.init(srconfig, debug);
        nfbeacon.update(type);
        Image.instance.events.load();
        expect(Image.instance.src).toBe(fullURL);
      }
    );

    it(
      'sampling rate is 50% - not sampled',
      () => {
        const srconfig = { ...config };
        srconfig.stats_sampling_rate = 50;
        randomValue = 0.8;
        nfbeacon.init(srconfig, debug);
        nfbeacon.update(type);
        expect(Image.instance.src).toBe('');
      }
    );
  });
});

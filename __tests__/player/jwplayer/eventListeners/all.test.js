/* eslint-env jest, browser */

// load module to be tested
import onAll from 'src/player/jwplayer/eventListeners/all';
import debug from 'src/lib/debugger';

// ** setup
let ev;
beforeAll(() => {
  debug.log = jest.fn();
  return true;
});

let toISOString;
const targetDate = '2020-11-27T04:41:20';
beforeEach(() => {
  ev = { name: 'adClick', testEvent: 1 };
  debug.log.mockClear();
  toISOString = Date.prototype.toISOString;
  // eslint-disable-next-line no-extend-native
  Date.prototype.toISOString = jest.fn().mockReturnValue(targetDate);
  return true;
});

afterEach(() => {
  Date.prototype.toISOString = toISOString; // eslint-disable-line no-extend-native
});

// ** run tests
describe('src/player/jwplayer/eventListeners/all', () => {
  test(
    'should call debug',
    () => {
      onAll({}, ev.name, ev);
      expect(debug.log).toHaveBeenCalledWith(`[ ${ev.name} ]`, targetDate, ev);
    }
  );

  it(
    'should not call debug for untracked events',
    () => {
      ev.name = 'time';
      onAll({}, ev.name, ev);
      expect(debug.log).not.toHaveBeenCalled();
      ev.name = 'adTime';
      onAll({}, ev.name, ev);
      expect(debug.log).not.toHaveBeenCalled();
      ev.name = 'bufferChange';
      onAll({}, ev.name, ev);
      expect(debug.log).not.toHaveBeenCalled();
      // and now it should trigger
      ev.name = 'timeOut';
      onAll({}, ev.name, ev);
      expect(debug.log).toHaveBeenCalledWith(`[ ${ev.name} ]`, targetDate, ev);
    }
  );
});

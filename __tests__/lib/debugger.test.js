/* eslint-env jest */
/* eslint-disable no-console */
import debug from 'src/lib/debugger';

global.console = {
  log: jest.fn(),
  warn: jest.fn()
};

beforeEach(() => {
  debug.set(false);
  console.log.mockClear();
  console.warn.mockClear();
  return true;
});

describe('src/lib/debugger', () => {
  test('should enable debug when passed true', () => {
    debug.set(false);
    debug.set(true);
    expect(debug.isEnabled()).toBeTruthy();
  });

  test('should disable debug when passed false', () => {
    debug.set(true);
    debug.set(false);
    expect(debug.isEnabled()).toBeFalsy();
  });

  test('should disable debug when no arguments provided', () => {
    debug.set(true);
    debug.set();
    expect(debug.isEnabled()).toBeFalsy();
  });

  test('should console.log with arguments', () => {
    debug.set(true);
    debug.log('test', 'message');
    expect(console.log).toHaveBeenCalledWith('test', 'message');
  });

  test('should console.warn with arguments', () => {
    debug.set(true);
    debug.warn('warning', 'message');
    expect(console.warn).toHaveBeenCalledWith('warning', 'message');
  });

  test('when debug is disabled, log and warn should not call', () => {
    debug.set(false);
    debug.log('message');
    expect(console.log).not.toHaveBeenCalled();
    debug.set(false);
    debug.warn('warning');
    expect(console.warn).not.toHaveBeenCalled();
  });
});

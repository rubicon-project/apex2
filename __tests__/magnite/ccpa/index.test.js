/* eslint-env es6,jest,browser */
/* eslint-disable no-underscore-dangle */
import debug from 'src/lib/debugger';

jest.mock('src/lib/debugger');

let ccpa;
let msgCallback = () => {};

beforeAll(async () => {
  window.top.postMessage = jest.fn();
  window.addEventListener = jest.fn((ev, cb) => {
    msgCallback = cb;
  });
  const obj = await import('src/magnite/ccpa'); // dynamic import because of event listeners
  ccpa = obj.default;
});

beforeEach(() => {
  // Clear JSDOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  // clear mocks
  debug.log.mockClear();
  window.addEventListener.mockClear();
  window.top.postMessage.mockClear();
  ccpa.uspString = '';
});

// ** run tests
describe('src/js/plugins/ccpa', () => {
  describe('uspApiCall', () => {
    test(
      'should send message',
      () => {
        expect(window.top.postMessage).not.toHaveBeenCalled();
        ccpa.uspApiCall();
        expect(window.top.postMessage).toHaveBeenCalledWith({
          __uspapiCall: {
            callId: expect.any(String),
            command: 'getUSPData',
            version: 1
          }
        }, '*');
      }
    );

    test(
      'should handle message - 1',
      () => {
        const uspString = '1YNN';
        msgCallback({
          data: {
            __uspapiReturn: {
              success: true,
              returnValue: {
                uspString
              }
            }
          }
        });
        expect(debug.log).toHaveBeenCalledWith('CCPA uspHandler', { uspString }, true, false);
        expect(ccpa.uspString).toEqual(uspString);
      }
    );

    test(
      'should handle message - no success',
      () => {
        const uspString = '1YNN';
        msgCallback({
          data: {
            __uspapiReturn: {
              success: false,
              returnValue: {
                uspString
              }
            }
          }
        });
        expect(ccpa.uspString).toEqual('');
      }
    );
  });

  describe('uspApiCall - via window.__uspapi call', () => {
    test(
      'should call window.__uspapi',
      () => {
        const version = 1;
        window.__uspapi = jest.fn();
        ccpa.uspApiCall();
        expect(window.__uspapi).toHaveBeenCalledWith(
          'getUSPData',
          version,
          expect.any(Function)
        );
        delete window.__uspapi;
      }
    );
  });

  describe('set usp string', () => {
    test(
      'should set usp string',
      () => {
        const uspString = '1YNN';
        expect(ccpa.uspString).not.toEqual(uspString);
        ccpa.uspString = uspString;
        expect(ccpa.uspString).toEqual(uspString);
      }
    );
  });

  describe('createUspPromise', () => {
    test(
      'should set usp string from adParameters',
      async () => {
        const uspString = '1YNN';
        const adParameters = {
          us_privacy: uspString
        };
        expect(ccpa.uspString).not.toEqual(uspString);
        const ccpaPromise = ccpa.createUspPromise(adParameters);
        await Promise.resolve().then(ccpaPromise);
        expect(ccpa.uspString).toEqual(uspString);
      }
    );

    test(
      'should set usp string from API call',
      async () => {
        const uspString = '1YNN';
        const adParameters = {};
        expect(ccpa.uspString).not.toEqual(uspString);
        expect(window.top.postMessage).not.toHaveBeenCalled();
        const ccpaPromise = ccpa.createUspPromise(adParameters);
        await Promise.resolve().then(ccpaPromise);
        expect(window.top.postMessage).toHaveBeenCalledWith({
          __uspapiCall: {
            callId: expect.any(String),
            command: 'getUSPData',
            version: 1
          }
        }, '*');
        expect(ccpa.uspString).not.toEqual(uspString);
        msgCallback({
          data: {
            __uspapiReturn: {
              success: true,
              returnValue: {
                uspString
              }
            }
          }
        });
        expect(ccpa.uspString).toEqual(uspString);
      }
    );
  });
});

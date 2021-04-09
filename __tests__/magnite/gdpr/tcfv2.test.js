/* eslint-env es6,jest,browser */
/* eslint-disable no-underscore-dangle */
import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';

jest.mock('src/lib/debugger');

let msgCallback = () => {};
let tcfv2;
let tcfv2iframe;

beforeAll(async () => {
  debug.log = jest.fn();
  window.addEventListener = jest.fn((ev, cb) => {
    msgCallback = cb;
  });
  window.top.postMessage = jest.fn();
  const obj = await import('src/magnite/gdpr/tcfv2');
  tcfv2 = obj.default;
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
  gdpr.reset();
  tcfv2iframe = document.createElement('iframe');
  tcfv2iframe.name = '__tcfapiLocator';
  document.body.appendChild(tcfv2iframe);
});

// ** run tests
describe('src/js/plugins/gdpr/tcfv2', () => {
  describe('getConsentData - via message event', () => {
    test(
      'should not do anything if tcfapilocator is not present',
      () => {
        // Clear JSDOM
        while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }
        expect(window.top.postMessage).not.toHaveBeenCalled();
        tcfv2.getConsentData();
        expect(window.top.postMessage).not.toHaveBeenCalled();
      }
    );

    test(
      'should send message',
      () => {
        expect(window.top.postMessage).not.toHaveBeenCalled();
        tcfv2.getConsentData();
        expect(window.top.postMessage).toHaveBeenCalledWith({
          __tcfapiCall: {
            callId: expect.any(String),
            version: 2,
            command: 'getTCData'
          }
        }, '*');
      }
    );

    test(
      'should handle message - 1',
      () => {
        const gdprApplies = true;
        const tcString = 'AABBCCDD';
        msgCallback({
          data: {
            __tcfapiReturn: {
              success: true,
              returnValue: {
                gdprApplies,
                tcString
              }
            }
          }
        });
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 1,
          gdpr_consent: tcString
        });
      }
    );

    test(
      'should handle message - 2',
      () => {
        const gdprApplies = false;
        const tcString = 'DDEEFF';
        msgCallback({
          data: {
            __tcfapiReturn: {
              success: true,
              returnValue: {
                gdprApplies,
                tcString
              }
            }
          }
        });
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 0,
          gdpr_consent: tcString
        });
      }
    );
  });

  test(
    'should handle message - no success',
    () => {
      const gdprApplies = true;
      const tcString = 'AABBCCDD';
      msgCallback({
        data: {
          __tcfapiReturn: {
            success: false,
            returnValue: {
              gdprApplies,
              tcString
            }
          }
        }
      });
      expect(gdpr.getGDPR()).toEqual({
        gdpr: 0
      });
    }
  );

  describe('getConsentData - via window.__tcfapi call', () => {
    test(
      'should call window.__tcfapi',
      () => {
        window.__tcfapi = jest.fn();
        tcfv2.getConsentData();
        expect(window.__tcfapi).toHaveBeenCalledWith(
          'getTCData',
          2,
          expect.any(Function)
        );
        delete window.__tcfapi;
      }
    );
  });

  describe('setConsentData', () => {
    test(
      'should set consent data',
      () => {
        const consentData = {
          gdpr: 0,
          gdpr_consent: 'XYZZY'
        };
        expect(gdpr.getGDPR()).not.toEqual(consentData);
        gdpr.setConsentData(consentData, 2);
        expect(gdpr.getGDPR()).toEqual(consentData);
      }
    );
  });

  describe('consent status getter/setter', () => {
    test(
      'should get and set consent flag',
      () => {
        expect(gdpr.consent).toBe(true);
        gdpr.consent = false;
        expect(gdpr.consent).toBe(false);
        gdpr.consent = true;
        expect(gdpr.consent).toBe(true);
      }
    );
  });

  describe('message callback', () => {
    test(
      'normal event',
      () => {
        const fnCb = jest.fn();
        tcfv2.registerCb(fnCb);
        expect(fnCb).not.toHaveBeenCalled();
        msgCallback({ data: { __tcfapiReturn: { command: 'getConsentData', returnValue: 'CONSENT', success: true } } });
        expect(debug.log).toHaveBeenCalledWith('GDPR TCFv2 handler', 'CONSENT', true);
        expect(fnCb).toHaveBeenCalled();
      }
    );

    test(
      'event without __cmpReturn',
      () => {
        const fnCb = jest.fn();
        tcfv2.registerCb(fnCb);
        expect(fnCb).not.toHaveBeenCalled();
        msgCallback({ data: {} });
        expect(fnCb).not.toHaveBeenCalled();
        expect(gdpr.getGDPR()).toEqual({});
      }
    );

    test(
      'event with empty cmp response',
      () => {
        const fnCb = jest.fn();
        tcfv2.registerCb(fnCb);
        expect(fnCb).not.toHaveBeenCalled();
        msgCallback({ data: { __tcfapiReturn: {} } });
        expect(fnCb).toHaveBeenCalled();
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 0
        });
      }
    );

    test(
      'event with cmp response with empty returnValue',
      () => {
        msgCallback({ data: { __tcfapiReturn: { returnValue: {}, success: true } } });
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 0
        });
      }
    );
  });
});

/* eslint-env es6,jest,browser */
/* eslint-disable no-underscore-dangle */
import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';

jest.mock('src/lib/debugger');

let msgCallback = () => {};
let tcfv1;

beforeAll(async () => {
  window.top.postMessage = jest.fn();
  window.addEventListener = jest.fn((ev, cb) => {
    msgCallback = cb;
  });
  const obj = await import('src/magnite/gdpr/tcfv1');
  tcfv1 = obj.default;
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
});

// ** run tests
describe('src/js/plugins/gdpr/tcfv1', () => {
  describe('getConsentData - via message event', () => {
    test(
      'should send message',
      () => {
        expect(window.top.postMessage).not.toHaveBeenCalled();
        tcfv1.getConsentData();
        expect(window.top.postMessage).toHaveBeenCalledWith({
          __cmpCall: {
            callId: expect.any(String),
            command: 'getConsentData'
          }
        }, '*');
      }
    );

    test(
      'should handle message - 1',
      () => {
        const gdprApplies = true;
        const consentData = 'AABBCCDD';
        msgCallback({
          data: {
            __cmpReturn: {
              success: true,
              returnValue: {
                gdprApplies,
                consentData
              }
            }
          }
        });
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 1,
          gdpr_consent: consentData
        });
      }
    );

    test(
      'should handle message - 2',
      () => {
        const gdprApplies = false;
        const consentData = 'DDEEFF';
        msgCallback({
          data: {
            __cmpReturn: {
              success: true,
              returnValue: {
                gdprApplies,
                consentData
              }
            }
          }
        });
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 0,
          gdpr_consent: consentData
        });
      }
    );
  });

  test(
    'should handle message - no success',
    () => {
      const gdprApplies = true;
      const consentData = 'AABBCCDD';
      msgCallback({
        data: {
          __cmpReturn: {
            success: false,
            returnValue: {
              gdprApplies,
              consentData
            }
          }
        }
      });
      expect(gdpr.getGDPR()).toEqual({
        gdpr: 0
      });
    }
  );

  describe('getConsentData - via window.__cmp call', () => {
    test(
      'should call window.__cmp',
      () => {
        window.__cmp = jest.fn();
        tcfv1.getConsentData();
        expect(window.__cmp).toHaveBeenCalledWith(
          'getConsentData',
          null,
          expect.any(Function)
        );
        delete window.__cmp;
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
        gdpr.setConsentData(consentData, 1);
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
        tcfv1.registerCb(fnCb);
        expect(fnCb).not.toHaveBeenCalled();
        msgCallback({ data: { __cmpReturn: { command: 'getConsentData', returnValue: 'CONSENT', success: true } } });
        expect(debug.log).toHaveBeenCalledWith('GDPR TCFv1 handler', 'CONSENT', true);
        expect(fnCb).toHaveBeenCalled();
      }
    );

    test(
      'event without __cmpReturn',
      () => {
        const fnCb = jest.fn();
        tcfv1.registerCb(fnCb);
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
        tcfv1.registerCb(fnCb);
        expect(fnCb).not.toHaveBeenCalled();
        msgCallback({ data: { __cmpReturn: {} } });
        expect(fnCb).toHaveBeenCalled();
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 0
        });
      }
    );

    test(
      'event with cmp response with empty returnValue',
      () => {
        msgCallback({ data: { __cmpReturn: { returnValue: {}, success: true } } });
        expect(gdpr.getGDPR()).toEqual({
          gdpr: 0
        });
      }
    );
  });
});

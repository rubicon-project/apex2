/* eslint-env es6,jest,browser */
/* eslint-disable no-underscore-dangle */
import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';
import tcfv1 from 'src/magnite/gdpr/tcfv1';
import tcfv2 from 'src/magnite/gdpr/tcfv2';

jest.mock('src/lib/debugger');
let tcfv2iframe;

beforeEach(() => {
  // Clear JSDOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  // clear mocks
  debug.log.mockClear();
  gdpr.reset();
  tcfv2iframe = document.createElement('iframe');
  tcfv2iframe.name = '__tcfapiLocator';
  document.body.appendChild(tcfv2iframe);
});

function runPromises (adParameters) {
  const tcfv2Promise = tcfv2.createConsentPromise(adParameters);
  const tcfv1Promise = tcfv1.createConsentPromise(adParameters);
  return Promise.resolve()
    .then(() => tcfv2Promise)
    .then(() => tcfv1Promise);
}

// ** run tests
describe('src/js/plugins/gdpr', () => {
  test(
    'parameters',
    async () => {
      expect.assertions(1);
      const adParameters = {
        gdpr: 1,
        gdpr_consent: 'consent-string'
      };
      await runPromises(adParameters);
      expect(gdpr.getGDPR()).toEqual({
        gdpr: adParameters.gdpr,
        gdpr_consent: adParameters.gdpr_consent
      });
    }
  );

  test(
    'tcfv1 only - call cmplocator',
    async () => {
      expect.assertions(1);
      const gdprReturnValue = {
        gdprApplies: true,
        consentData: 'CONSENT-DATA-TCF1'
      };
      const tcfv1EventListener = (event) => {
        if (event && event.data && event.data.__cmpCall) {
          window.top.postMessage({
            __cmpReturn: {
              success: true,
              returnValue: gdprReturnValue
            }
          }, '*');
        }
      };
      window.top.addEventListener('message', tcfv1EventListener, false);
      await runPromises({});
      expect(gdpr.getGDPR()).toEqual({
        gdpr: 1,
        gdpr_consent: gdprReturnValue.consentData
      });
      window.top.removeEventListener('message', tcfv1EventListener, false);
    }
  );

  test(
    'tcfv2 only - call tcflocator',
    async () => {
      expect.assertions(1);
      const gdprReturnValue = {
        gdprApplies: true,
        tcString: 'CONSENT-DATA-TCF2'
      };
      const tcfv2EventListener = (event) => {
        if (event && event.data && event.data.__tcfapiCall) {
          window.top.postMessage({
            __tcfapiReturn: {
              success: true,
              returnValue: gdprReturnValue
            }
          }, '*');
        }
      };
      window.top.addEventListener('message', tcfv2EventListener, false);
      await runPromises({});
      expect(gdpr.getGDPR()).toEqual({
        gdpr: 1,
        gdpr_consent: gdprReturnValue.tcString
      });
      window.top.removeEventListener('message', tcfv2EventListener, false);
    }
  );

  test(
    'tcfv1 + tcfv2',
    async () => {
      expect.assertions(1);
      // tcfv1
      const tcfv1ReturnValue = {
        gdprApplies: true,
        consentData: 'CONSENT-DATA-TCF1'
      };
      const tcfv1EventListener = (event) => {
        if (event && event.data && event.data.__cmpCall) {
          window.top.postMessage({
            __cmpReturn: {
              success: true,
              returnValue: tcfv1ReturnValue
            }
          }, '*');
        }
      };
      window.top.addEventListener('message', tcfv1EventListener, false);
      // tcfv2
      const tcfv2ReturnValue = {
        gdprApplies: true,
        tcString: 'CONSENT-DATA-TCF2'
      };
      const tcfv2EventListener = (event) => {
        if (event && event.data && event.data.__tcfapiCall) {
          window.top.postMessage({
            __tcfapiReturn: {
              success: true,
              returnValue: tcfv2ReturnValue
            }
          }, '*');
        }
      };
      window.top.addEventListener('message', tcfv2EventListener, false);

      await runPromises({});
      expect(gdpr.getGDPR()).toEqual({
        gdpr: 1,
        gdpr_consent: tcfv2ReturnValue.tcString
      });

      window.top.removeEventListener('message', tcfv1EventListener, false);
      window.top.removeEventListener('message', tcfv2EventListener, false);
    }
  );
});

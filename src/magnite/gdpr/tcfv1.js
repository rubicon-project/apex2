/* eslint-env es6,browser */
/* eslint-disable no-underscore-dangle */
/**
 * GDPR TCFv1 support
 * @module magnite/gdpr/tcfv1
*/

import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';

let gdprCB = () => {
  // callback to call when got GDPR data
};
let callId = 0;

function cmpHandler (cmpResult, success) {
  debug.log('GDPR TCFv1 handler', cmpResult, success);
  let gdprStatus = {};
  if (!cmpResult || success === false) {
    gdprStatus = {
      gdpr: 0
    };
  } else {
    gdprStatus.gdpr = cmpResult.gdprApplies ? 1 : 0;
    if (cmpResult.consentData) {
      gdprStatus.gdpr_consent = cmpResult.consentData;
    }
  }
  gdpr.setConsentData(gdprStatus, 1);
  gdprCB();
}

window.addEventListener('message', (event) => {
  if (event && event.data && event.data.__cmpReturn) {
    cmpHandler(
      event.data.__cmpReturn.returnValue,
      event.data.__cmpReturn.success
    );
  }
}, false);

const tcfv1 = {
  createConsentPromise (adParameters) {
    if ('gdpr' in adParameters && 'gdpr_consent' in adParameters) {
      // GDPR - got consent data via redirect
      debug.log('GDPR TCFv1: got consent from adParameters');
      return new Promise((resolve) => {
        gdpr.setConsentData({
          gdpr: adParameters.gdpr,
          gdpr_consent: adParameters.gdpr_consent
        }, 1);
        resolve();
      });
    }
    // GDPR - call Consent Manager Provider API
    return new Promise((resolve) => {
      let isCalled = false;
      gdprCB = () => {
        isCalled = true;
        resolve();
      };
      this.getConsentData();
      setTimeout(() => {
        if (!isCalled) {
          debug.log('GDPR TCFv1: no response');
          isCalled = true;
          gdprCB();
        }
      }, 100);
    });
  },

  registerCb (cb) {
    gdprCB = cb;
  },

  getConsentData () {
    if (window.__cmp) {
      // same frame
      debug.log('GDPR TCFv1: call API on the same frame');
      window.__cmp('getConsentData', null, cmpHandler);
    } else {
      // iframe
      debug.log('GDPR TCFv1: send message to locator iframe');
      callId += 1;
      window.top.postMessage({
        __cmpCall: {
          callId: `iframe:${callId}`,
          command: 'getConsentData'
        }
      }, '*');
    }
  }
};

export default tcfv1;

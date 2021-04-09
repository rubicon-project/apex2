/* eslint-env es6,browser */
/* eslint-disable no-underscore-dangle */

/**
 * GDPR TCFv2 support
 * @module magnite/gdpr/tcfv2
*/

import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';

let tcfv2CB = () => {
  // callback to call when got GDPR data
};
let callId = 0;

function findTcfFrame (frame) {
  try {
    if (frame.frames.__tcfapiLocator) {
      debug.log('GDPR TCFv2: __tcfapiLocator iframe found');
      return frame;
    }
  } catch (ignore) {
    // ignore this error
  }
  if (frame === window.top) {
    debug.log('GDPR TCFv2: no __tcfapiLocator iframe detected');
    return null;
  }
  return findTcfFrame(frame.parent);
}

function tcfv2Handler (tcfResult, success) {
  debug.log('GDPR TCFv2 handler', tcfResult, success);
  let gdprStatus = {};
  if (!tcfResult || success === false) {
    gdprStatus = {
      gdpr: 0
    };
  } else {
    gdprStatus.gdpr = tcfResult.gdprApplies ? 1 : 0;
    if (tcfResult.tcString) {
      gdprStatus.gdpr_consent = tcfResult.tcString;
    }
  }
  gdpr.setConsentData(gdprStatus, 2);
  tcfv2CB();
}

window.addEventListener('message', (event) => {
  if (event && event.data && event.data.__tcfapiReturn) {
    tcfv2Handler(
      event.data.__tcfapiReturn.returnValue,
      event.data.__tcfapiReturn.success
    );
  }
}, false);

const tcfv2 = {
  createConsentPromise (adParameters) {
    if ('gdpr' in adParameters && 'gdpr_consent' in adParameters) {
      // GDPR - got consent data via redirect
      debug.log('GDPR TCFv2: got consent from adParameters');
      return new Promise((resolve) => {
        gdpr.setConsentData({
          gdpr: adParameters.gdpr,
          gdpr_consent: adParameters.gdpr_consent
        }, 2);
        resolve();
      });
    }
    // GDPR - call Consent Manager Provider API
    return new Promise((resolve) => {
      let isCalled = false;
      tcfv2CB = () => {
        isCalled = true;
        resolve();
      };
      this.getConsentData();
      setTimeout(() => {
        if (!isCalled) {
          debug.log('GDPR TCFv2: no response');
          isCalled = true;
          tcfv2CB();
        }
      }, 100);
    });
  },

  registerCb (cb) {
    tcfv2CB = cb;
  },

  getConsentData () {
    if (window.__tcfapi) {
      // same frame
      debug.log('GDPR TCFv2: call API on the same frame');
      window.__tcfapi('getTCData', 2, tcfv2Handler);
    } else {
      // find TCFv2 API locator iframe
      debug.log('GDPR TCFv2: detect locator iframe');
      const tcfFrame = findTcfFrame(window);
      if (!tcfFrame) {
        return;
      }
      // call locator iframe
      debug.log('GDPR TCFv2: send message to locator iframe');
      callId += 1;
      tcfFrame.postMessage({
        __tcfapiCall: {
          callId: `iframe:${callId}`,
          command: 'getTCData',
          version: 2
        }
      }, '*');
    }
  }
};

export default tcfv2;

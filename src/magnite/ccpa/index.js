/* eslint-env es6,browser */
/* eslint-disable no-underscore-dangle */
/**
 * CCPA support
 * @module magnite/ccpa
*/

import debug from 'src/lib/debugger';
import uuidv4 from 'src/lib/uuidv4';

let uspCB = () => {
  // callback to call when got USP string
};
const callId = uuidv4();
let uspString = '';

function uspHandler (uspData, success, uspCallId) {
  debug.log('CCPA uspHandler', uspData, success, uspCallId === callId);
  if (success) {
    uspString = uspData.uspString;
  }
  uspCB();
}

window.addEventListener('message', (event) => {
  if (event && event.data && event.data.__uspapiReturn) {
    uspHandler(
      event.data.__uspapiReturn.returnValue,
      event.data.__uspapiReturn.success,
      event.data.__uspapiReturn.callId
    );
  }
}, false);

const ccpa = {
  createUspPromise (adParameters) {
    // CCPA - us_privacy string is passed as adParameter
    if ('us_privacy' in adParameters) {
      debug.log('CCPA: got us_privacy from adParameters');
      return new Promise((resolve) => {
        this.uspString = adParameters.us_privacy;
        resolve();
      });
    }
    // CCPA - call USP API
    return new Promise((resolve) => {
      let isCalled = false;
      uspCB = () => {
        isCalled = true;
        resolve();
      };
      this.uspApiCall();
      setTimeout(() => {
        if (!isCalled) {
          debug.log('CCPA: no response');
          isCalled = true;
          uspCB();
        }
      }, 100);
    });
  },

  registerCb (cb) {
    uspCB = cb;
  },

  uspApiCall () {
    if (window.__uspapi) {
      // same frame
      debug.log('CCPA: call USP API on the same frame');
      window.__uspapi('getUSPData', 1, uspHandler);
    } else {
      // iframe
      debug.log('CCPA: send message to USP API');
      window.top.postMessage({
        __uspapiCall: {
          callId,
          command: 'getUSPData',
          version: 1
        }
      }, '*');
    }
  },

  set uspString (str) {
    uspString = str;
  },

  get uspString () {
    return uspString;
  }
};

export default ccpa;

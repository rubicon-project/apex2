/* eslint-env es6,browser */

/**
 * GDPR state container
 * @module magnite/gdpr
*/

let gdprStatus = {}; // { gdpr: [1|0], gdpr_consent: 'consentString' }
let gdprConsent = true; // is consent given?
let gdprVersion = 0;

const gdpr = {
  reset () {
    gdprStatus = {};
    gdprConsent = true;
    gdprVersion = 0;
  },

  setConsentData (data, version) {
    if (version > gdprVersion) {
      gdprVersion = version;
      gdprStatus = data;
    }
  },

  getGDPR () {
    return gdprStatus;
  },

  get consent () {
    return gdprConsent;
  },

  set consent (consent) {
    gdprConsent = consent;
  }
};

export default gdpr;

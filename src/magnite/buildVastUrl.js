/* eslint-env browser */
/**
 * Create VAST URL for Magnite Ad Server
 * @module magnite/buildVastUrl
*/
import debug from 'src/lib/debugger';
import gdpr from 'src/magnite/gdpr';
import ccpa from 'src/magnite/ccpa';

/**
 * Build VAST URL
 * @function buildVastUrl
 * @param {Object} apexConfig Apex config
 * @returns {String} VAST URL
 */
export default function buildVastUrl ({ width, height, magnite }) {
  if (
    !magnite.account_id
    || !magnite.site_id
    || !magnite.zone_id
    || !magnite.size_id
  ) {
    debug.warn('magnite: incorrect configuration', magnite);
    return null;
  }

  const { vastBaseUrl, vastQueryTypes, vastQuery } = magnite;

  // these query parameters can be overridden
  let queryParams = {
    rf: window.document.referrer
  };
  const gdprStatus = gdpr.getGDPR();
  if ('gdpr' in gdprStatus) {
    queryParams.gdpr = gdprStatus.gdpr;
  }
  if ('gdpr_consent' in gdprStatus) {
    queryParams.gdpr_consent = gdprStatus.gdpr_consent;
  }
  if (ccpa.uspString) {
    queryParams.us_privacy = ccpa.uspString;
  }

  // these query parameters can not be overridden
  const enforcedQueryParams = {
    width: Number(magnite.size_id) === 207 ? window.innerWidth : width,
    height: Number(magnite.size_id) === 207 ? window.innerHeight : height,
    account_id: magnite.account_id,
    site_id: magnite.site_id,
    zone_id: magnite.zone_id,
    size_id: magnite.size_id,
    'p_window.url': window.location.href,
    rp_secure: window.location.protocol === 'https:' ? 1 : 0,
    tk_apex: 2,
    cb: Math.random() * 1E18
  };

  // add user-defined ad params first
  if (typeof magnite.adParams === 'object') {
    queryParams = { ...queryParams, ...magnite.adParams };
  }
  // override them with enforced parameters
  queryParams = { ...queryParams, ...enforcedQueryParams };
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const vastUrl = `${vastBaseUrl}${vastQueryTypes[vastQuery]}?${queryString}`;
  return vastUrl;
}

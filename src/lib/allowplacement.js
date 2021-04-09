/* eslint-env browser */
/**
 * Check if player placement is disallowed
 * @module lib/allowplacement
*/

/**
 * Is it forbidden to place the ad unit?
 * @function isPlacementDisallowed
 * @param {Object} apexConfig Apex Configuration object
 * @returns {Boolean} True or false
 */
export default function isPlacementDisallowed (apexConfig) {
  if (apexConfig.includeAd && !document.querySelectorAll(apexConfig.includeAd).length) {
    return true;
  }
  if (apexConfig.excludeAd && document.querySelectorAll(apexConfig.excludeAd).length) {
    return true;
  }
  return false;
}

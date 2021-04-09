/**
 * JWPlayer 'adClick' event listener
 * @module player/jwplayer/eventListeners/adClick
*/

import { createImage } from 'src/lib/dom';

/**
 * Create tracker pixel for adClick event, if required
 * @function adClick
 * @param {Object} jwplayerController Player controller instance
 * @returns {undefined} Nothing.
 */
export default function adClick (jwplayerController) {
  const adClickUrl = jwplayerController.apexConfig.adClick;
  if (adClickUrl) {
    createImage(adClickUrl);
  }
}

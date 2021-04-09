/**
 * JWPlayer 'adImpression' event listener
 * @module player/jwplayer/eventListeners/adImpression
*/

import debug from 'src/lib/debugger';
import { createImage } from 'src/lib/dom';

import createCloseButton from 'src/player/createCloseButton';

/**
 * Create tracker pixel for adImpression event, if required
 * @function adImpression
 * @param {Object} jwplayerController JWPlayer controller instance
 * @param {Object} ev Event object
 * @returns {undefined} Nothing.
 */
export default function adImpression (jwplayerController, ev) {
  debug.log(`Heard the adImpression: ${new Date().toISOString()}`, ev);
  // create 'Close' button if needed
  const playerWrapper = jwplayerController.jwplayer.getContainer();
  createCloseButton(playerWrapper, jwplayerController.apexConfig, jwplayerController);
  // init pixel tracker the adImpression option
  const adImpressionUrl = jwplayerController.apexConfig.adImpression;
  if (adImpressionUrl) {
    createImage(adImpressionUrl);
  }
}

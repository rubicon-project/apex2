/* eslint-env browser */
/**
 * JWPlayer 'adError' event listener
 * @module player/jwplayer/eventListeners/adError
*/

import rerenderMultiFormat from 'src/magnite/rerenderMultiFormat';
import debug from 'src/lib/debugger';

/**
 * Call passback function and remove the player from DOM
 * @function adError
 * @param {Object} JWPlayerController JWPlayer controller instance
 * @param {Object} error Error event
 * @returns {undefined} Nothing.
 */
export default function onAdError (JWPlayerController, error) {
  const { apexConfig } = JWPlayerController;
  const { multiFormat } = apexConfig;
  debug.log(`Ad ERROR: ${new Date().toISOString()}`, error);

  if (multiFormat && apexConfig.isMobile && Number(apexConfig.magnite.size_id) === 207) {
    rerenderMultiFormat();
  } else {
    // don't call passback when multiFormat is in action
    JWPlayerController.callPassback();
  }
  JWPlayerController.remove();
}

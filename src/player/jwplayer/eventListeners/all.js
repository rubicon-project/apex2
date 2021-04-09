/**
 * JWPlayer 'all' event listener
 * @module player/jwplayer/eventListeners/all
*/

import debug from 'src/lib/debugger';

/**
 * Log all events (for debug purposes)
 * @function handleEventAll
 * @param {Object} jwplayerController JWPlayer controller instance (unused)
 * @param {String} name Event name
 * @param {Object} evObj Event object
 * @returns {undefined} Nothing.
 */
export default function handleEventAll (jwplayerController, name, evObj) {
  if (/^(time|adTime|bufferChange)$/.test(name)) {
    // don't do excessive logging
    return;
  }
  debug.log(`[ ${name} ]`, new Date().toISOString(), evObj);
}

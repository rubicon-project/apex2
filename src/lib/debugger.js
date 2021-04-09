/**
 * Console output of debug messages.
 * @module lib/debugger
*/
const debug = {
  debuggerOn: false,

  /**
   * Is debug mode enabled?
   * @method isEnabled
   * @returns {Boolean} Status of debugger.
   */
  isEnabled () {
    return this.debuggerOn;
  },

  /**
   * Set debug mode
   * @method set
   * @returns {undefined} Nothing.
   */
  set (debugFlag = false) {
    this.debuggerOn = !!debugFlag; // implicitly set to boolean
  },

  /**
   * Display debug message
   * @method log
   * @returns {undefined} Nothing.
   */
  log (...args) {
    if (this.debuggerOn) {
      console.log.apply(null, args); // eslint-disable-line no-console
    }
  },

  /**
   * Display debug warning
   * @method warn
   * @returns {undefined} Nothing.
   */
  warn (...args) {
    if (this.debuggerOn) {
      console.warn.apply(null, args); // eslint-disable-line no-console
    }
  }
};

export default debug;

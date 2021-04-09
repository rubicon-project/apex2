/* eslint-env browser */
/**
 * Creates Apex iframe and instantiates video player in it
 * @module player/jwplayer
*/

import deepMerge from 'src/lib/deepmerge';
import debug from 'src/lib/debugger';

import { createElement } from 'src/lib/dom';
import handleEventAll from 'src/player/jwplayer/eventListeners/all';
import handleAdImpression from 'src/player/jwplayer/eventListeners/adImpression';
import handleAdClick from 'src/player/jwplayer/eventListeners/adClick';
import handleAdError from 'src/player/jwplayer/eventListeners/adError';

/**
 * Override video player styles
 * @param {Window} window Target window object
 * @returns {undefined} Nothing.
 */
function setPlayerStyles (window) {
  const doc = window.document;
  const css = createElement(doc, 'style', { type: 'text/css' });
  // hide fullscreen button
  css.innerHTML = '.jw-icon.jw-icon-inline.jw-icon-fullscreen {display:none}';
  doc.head.appendChild(css);
}

/**
 * Create a placeholder where the player was located
 * @param {Window} window Target window object
 * @param {Object} apexConfig Apex configuration object
 * @returns {HTMLElement} DIV placeholder
 */
function createPlaceholder (window, apexConfig) {
  return createElement(window.document, 'div', {
    style: {
      width: `${apexConfig.width}px`,
      height: `${apexConfig.height}px`
    }
  });
}

/**
 * Create JWPlayer config object out of Apex config object.
 * @param {Object} apexConfig Apex configuration object
 * @returns {Object} JWPlayer configuration object
 */
function configureJWPlayer (apexConfig) {
  const playerParameters = {
    width: apexConfig.width,
    height: apexConfig.height,
    advertising: {
      tag: apexConfig.vastUrl,
      endstate: apexConfig.collapse ? 'close' : 'suspended'
    },
    intl: {
      en: {
        advertising: {
          admessage: ' '
        }
      }
    }
  };
  if (apexConfig.floating && !apexConfig.isMobile) {
    playerParameters.floating = {
      mode: 'notVisible',
      dismissible: false
    };
  }
  if (apexConfig.label) {
    playerParameters.displayHeading = true;
    playerParameters.intl.en.advertising.displayHeading = apexConfig.label;
  }

  // create JwPlayer config object
  const jwplayerConfig = deepMerge(
    apexConfig.player.jwplayer,
    playerParameters
  );
  // remove parameters unused by JWPlayer
  delete jwplayerConfig.playerUrl;

  return jwplayerConfig;
}

/**
 * @class
 */
const JWPlayerController = {
  /**
   * Initialize JWPlayer:
   * - create config object for player
   * - override player styles
   * - initialize player
   * - register event handlers
   * @method init
   * @param {HTMLElement} wrapper   Video player wrapper DIV
   * @param {Window} window         Window where the player is attached
   * @param {Object} apexConfig     Apex configuration object
   * @param {String} attachPlayerTo ID of the DOM element where to attach JWPlayer
   * @returns {undefined} Nothing.
   */
  init (wrapper, windowWithPlayer, apexConfig, attachPlayerTo) {
    const jwplayerConfig = configureJWPlayer(apexConfig);
    // setup player
    setPlayerStyles(windowWithPlayer);
    this.jwplayer = windowWithPlayer.jwplayer(attachPlayerTo);
    this.jwplayer.setup(jwplayerConfig);
    // save parameters
    this.apexConfig = apexConfig;
    this.wrapper = wrapper;
    this.windowWithPlayer = windowWithPlayer;
    // set vertical video
    if (this.verticalVideo) {
      this.verticalVideo.initialize(this.jwplayer);
    } else {
      // resize player if needed
      const { width } = wrapper.firstChild.getBoundingClientRect();
      if (width !== jwplayerConfig.width) {
        const ratio = width / jwplayerConfig.width;
        const height = jwplayerConfig.height * ratio;
        this.resize(width, height);
      }
    }
    // register event listeners
    if (apexConfig.apexdebug) {
      this.addListener('all', handleEventAll);
    }
    this.addListener('adImpression', handleAdImpression);
    this.addListener('adClick', handleAdClick);
    this.addListener('adError', handleAdError);
    this.addListener('complete', () => setTimeout(() => this.remove(), 200));
  },

  /**
   * Resize JWPlayer window
   * @method resize
   * @param {Number} width Player width, in pixels
   * @param {Number} height Player height, in pixels
   * @returns Operation result
   */
  resize (width, height) {
    return this.jwplayer.resize(width, height);
  },

  /**
   * Add JWPlayer event listener.
   * Event listener function takes playerController as first argument.
   * @method addListener
   * @param {String} event Event name
   * @param {Function} listener Event listener function.
   * @returns Operation result
   */
  addListener (event, listener) {
    return this.jwplayer.on(event, (...args) => listener(this, ...args));
  },

  /**
   * Check if global JWPlayer object is already defined
   * @method isPresent
   * @param {Window} window Target window
   * @returns {Boolean} true/false
   */
  isPresent (window) {
    return !!window.jwplayer;
  },

  /**
   * Removes video player from the page
   * @method remove
   * @returns {undefined} Nothing.
   */
  remove () {
    const { wrapper, windowWithPlayer, apexConfig } = this;
    if (this.verticalVideo) {
      this.verticalVideo.destroy();
    }
    if (this.jwplayer) {
      this.jwplayer.remove();
    }
    if (this.iframeSizeWatch) {
      clearInterval(this.iframeSizeWatch);
    }
    // remove all elements inside of the wrapper
    if (wrapper.firstChild) {
      wrapper.firstChild.remove();
    }
    // reset wrapper styles
    wrapper.removeAttribute('style');
    // add placeholder if collapse is set to false
    if (!apexConfig.collapse) {
      wrapper.appendChild(
        createPlaceholder(windowWithPlayer, apexConfig)
      );
    }
  },

  /**
   * Calls passback function in global window context
   * @method callPassback
   * @returns {undefined} Nothing.
   */
  callPassback () {
    const { passback } = this.apexConfig;
    // use global window here
    if (passback && typeof window[passback] === 'function') {
      debug.log('Calling passback function:', passback);
      window[passback](this.wrapper);
    }
  }
};

export default JWPlayerController;

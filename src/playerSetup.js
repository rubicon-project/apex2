/* eslint-env browser */

/**
 * Creates Apex iframe and instantiates video player in it
 * @module playerSetup
*/

import debug from 'src/lib/debugger';
import { createScriptElement } from 'src/lib/dom';
import { createPlayerWrapper, createPlayerContainer, createPlayerFrame, attachPlayer } from 'src/playerPlacement';
import VerticalVideo from 'src/verticalVideo';

/**
 * @class
 */
const PlayerSetup = {
  /*
  Object properties
  -----------------
  apexConfig        // Apex Config object
  randomId          // Random number, to create unique DOM elements
  position          // Player placement position
  align             // Player alignment
  node              // Node to attach Apex wrapper
  playerController  // Player Controller instance
  attachPlayerTo    // ID of the element
  playerWrapper     // DOM element
  playerFrame       // DOM Element
  */

  /**
   * Save Apex config to PlayerSetup object.
   * @method setApexConfig
   * @param {Object} apexConfig Apex configuration object
   * @returns {Object} Self.
   */
  setApexConfig (apexConfig) {
    this.apexConfig = apexConfig;
    return this;
  },

  /**
   * Set 'position', 'align', and 'node' properties of PlayerSetup
   * @method setPlacement
   * @param {Object} placement Placement object, contains 'position', 'align', and 'node' properties
   * @returns {Object} Self.
   */
  setPlacement (placement) {
    this.position = placement.position;
    this.align = placement.align;
    this.node = placement.node;
    return this;
  },

  /**
   * Set random ID to use as part of DOM elements.
   * @method setRandomId
   * @param {String} randomId Random identifier
   * @returns {Object} Self.
   */
  setRandomId (randomId) {
    this.randomId = randomId;
    return this;
  },

  /**
   * Save video player controller to instantiate video player later.
   * @method setPlayerController
   * @param {Object} playerController Player Controller instance
   * @returns {Object} Self.
   */
  setPlayerController (playerController) {
    this.playerController = playerController;
    return this;
  },

  /**
   * Create DIV to wrap video player. Set player alignment.
   * @method setupPlayerWrapper
   * @returns {Object} Self.
   */
  setupPlayerWrapper () {
    const { apexConfig, randomId, align } = this;
    this.attachPlayerTo = `${apexConfig.player.attachTo}-${randomId}`;
    this.playerWrapper = createPlayerWrapper(randomId, align);
    return this;
  },

  /**
   * Create IFRAME to contain video player.
   * Configure onload property for iframe to finish player setup when iframe content is loaded.
   * @method setupPlayerIframe
   * @returns {Object} Self.
   */
  setupPlayerIframe () {
    const { apexConfig, attachPlayerTo, randomId, playerController } = this;
    const playerFrame = createPlayerFrame(
      attachPlayerTo,
      apexConfig.width,
      randomId
    );
    playerFrame.onload = () => {
      const playerFrameWindow = playerFrame.contentWindow;
      const playerFrameDocument = playerFrameWindow.document;
      this.postAttach(playerFrameWindow);
      // change iframe height when content changes
      playerController.iframeSizeWatch = setInterval(
        () => {
          const newHeight = `${playerFrameDocument.documentElement.scrollHeight}px`;
          if (playerFrame.style.height !== newHeight) {
            playerFrame.style.height = newHeight;
          }
        },
        30
      );
    };
    this.playerFrame = playerFrame;
    return this;
  },

  /**
   * Create DIV to contain video player - alternative to setupPlayerFrame.
   * @method setupPlayerContainer
   * @returns {Object} Self.
   */
  setupPlayerContainer () {
    const { apexConfig, attachPlayerTo } = this;
    this.playerFrame = createPlayerContainer(
      attachPlayerTo,
      apexConfig.width
    );
    return this;
  },

  setupVertical () {
    const { apexConfig, playerController, playerWrapper } = this;
    if (apexConfig.isMobile && Number(apexConfig.magnite.size_id) === 207) {
      apexConfig.label = false;
      apexConfig.collapse = false; // vertical video should always collapse
      apexConfig.width = '100%';
      apexConfig.player.jwplayer.aspectratio = '9:16';
      playerController.verticalVideo = new VerticalVideo(playerWrapper);
    }
  },

  /**
   * Attach playerFrame (IFRAME or DIV) to the playerWrapper,
   * then attach playerWrapper to DOM of the publisher's page.
   * @method attachPlayerToPage
   * @returns {Object} Self.
   */
  attachPlayerToPage () {
    const { playerWrapper, playerController, playerFrame, position, node } = this;
    playerWrapper.appendChild(playerFrame);
    if (playerController.verticalVideo) {
      document.body.appendChild(this.playerWrapper);
      attachPlayer(position, node, playerController.verticalVideo.fakeWrapper);
      return this;
    }
    attachPlayer(position, node, playerWrapper);
    return this;
  },

  /**
   * Perform post-attach operations when we use DIV as player wrapper.
   * @method startPlayer
   * @returns {Object} Self.
   */
  startPlayer () {
    return this.postAttach(window);
  },

  /**
   * Perform post-attach operations:
   * - create close button, if needed
   * - load video player script
   * - instantiate player controller, when script is loaded
   * @method postAttach
   * @param {HTMLElement} window Window object where player is attached to (may be inside of iframe)
   * @returns {Object} Self.
   */
  postAttach (window) {
    const { apexConfig, attachPlayerTo, playerWrapper, playerController } = this;
    debug.log('Apex Config', apexConfig);
    // load player
    createScriptElement(
      window.document,
      apexConfig.player[apexConfig.renderer].playerUrl,
      () => playerController.init(playerWrapper, window, apexConfig, attachPlayerTo)
    );
    return this;
  }
};

export default PlayerSetup;

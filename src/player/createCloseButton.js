/* eslint-env browser */
/**
 * "Close" button for the video player
 * @module player/createCloseButton
*/

import btnClose from 'src/../assets/btnClose.svg';
import { createElement } from 'src/lib/dom';

/**
 * Create "close" button and attach it to the player frame
 * @function createCloseButton
 * @param {HTMLElement} playerFrame DOM Element where to attach the button
 * @param {Object} apexConfig Apex configuration object
 * @param {Object} playerController Video player controller instance
 * @returns {undefined} Nothing.
 */
export default function createCloseButton (playerFrame, apexConfig, playerController) {
  if (!apexConfig.closeButton) {
    return;
  }

  const buttonStyle = {
    position: 'absolute',
    width: '20px',
    height: '20px',
    margin: '0px 0px 20px 20px',
    top: '5px',
    right: '5px',
    left: 'auto',
    bottom: 'auto',
    'background-image': `url(${btnClose})`,
    'background-repeat': 'no-repeat',
    'background-size': 'contain',
    display: 'block',
    cursor: 'pointer',
    'pointer-events': 'all'
  };
  const closeEvent = apexConfig.isMobile ? 'touchend' : 'click';
  const div = createElement(document, 'div', { class: 'magnite-apex-close', style: buttonStyle });
  div.addEventListener(closeEvent, (evt) => {
    evt.preventDefault();
    playerController.remove();
  }, false);
  playerFrame.appendChild(div);
}

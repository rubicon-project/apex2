/* eslint-env browser */
/**
 * Player placement helper functions
 * @module playerPlacement
*/

import { createElement } from 'src/lib/dom';
import getTargetNode from 'src/targetNode';

/**
 * Get placement based on the 'placement' section of Apex config
 * @param {Object} placementOptions 'placement' section of Apex config object
 * @returns {Object} Placement object with 'position', 'align', and 'node' properties
 */
export function getPlacement (placementOptions) {
  // read placement options
  let apexPlacement = placementOptions;
  if (!Array.isArray(apexPlacement)) {
    apexPlacement = [apexPlacement]; // convert single placement option to array
  }
  // iterate placement options until we get a DOM node
  const targetPlacement = apexPlacement.reduce((placement, option) => {
    if (placement && placement.node) {
      return placement;
    }
    return getTargetNode(option);
  }, { node: null });

  if (targetPlacement.node === null) {
    return null;
  }
  return targetPlacement;
}

/**
 * Create DIV element to wrap video player
 * @param {String} randomId  Random identifier of the wrapper
 * @param {String} align     Player alignment (left/center/right). Default is 'center'.
 * @returns DOM element of the wrapper
 */
export function createPlayerWrapper (randomId, align) {
  let contentAlign = 'center';
  if (align === 'left') {
    contentAlign = 'flex-start';
  }
  if (align === 'right') {
    contentAlign = 'flex-end';
  }
  return createElement(
    document,
    'div',
    {
      id: `MagniteApex-wrapper-${randomId}`,
      style: {
        width: '100%',
        overflow: 'hidden',
        // 'margin-top': margin.top,
        // 'margin-bottom': margin.bottom,
        position: 'relative',
        clear: 'both',
        display: 'flex',
        'justify-content': contentAlign
      }
    }
  );
}

/**
 * Create player container DIV
 * @param {String} playerAttachId   Id of the DIV element
 * @param {String} playerWidth      Width of the video player
 * @returns DOM element of the container
 */
export function createPlayerContainer (playerAttachId, playerWidth) {
  return createElement(
    document,
    'div',
    {
      id: playerAttachId,
      style: {
        'background-color': 'transparent',
        border: '0px none transparent',
        margin: '0px',
        padding: '0px',
        overflow: 'hidden',
        width: `${playerWidth}px`,
        display: 'block'
      }
    }
  );
}

/**
 * Create IFRAME for player placement
 * @param {String} playerAttachId ID of the element where video player should be attached
 * @param {Number} playerWidth    Player width in pixels.
 * @param {String} randomId       Random identifier
 * @returns DOM element of the IFRAME
 */
export function createPlayerFrame (playerAttachId, playerWidth, randomId) {
  return createElement(
    document,
    'iframe',
    {
      id: `MagniteApex-iframe-${randomId}`,
      style: {
        'background-color': 'transparent',
        border: '0px none transparent',
        margin: '0px',
        padding: '0px',
        overflow: 'hidden',
        width: `${playerWidth}px`,
        height: '1px',
        display: 'block'
      },
      srcdoc: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body style="margin:0px;padding:0px;overflow:hidden"><div id="${playerAttachId}"></div></body></html>`
    }
  );
}

/**
 * Attach player wrapper to document
 * @param {String} position   Placement position (append/prepend/before/after). Default is 'after'
 * @param {Object} node       DOM element where to attach Apex player
 * @param {Object} playerNode DOM element of the Apex player
 * @returns {undefined} Nothing.
 */
export function attachPlayer (position, node, playerNode) {
  switch (position) {
  case 'append':
    node.append(playerNode);
    break;
  case 'prepend':
    node.prepend(playerNode);
    break;
  case 'before':
    node.before(playerNode);
    break;
  default: // after
    node.after(playerNode);
  }
}

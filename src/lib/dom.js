/* eslint-env browser */
/**
 * DOM manipulation utilities
 * @module lib/dom
*/

/**
 * Create DOM element with given parameters
 * @param {Document} doc Target HTML document object
 * @param {String} tag HTML tag
 * @param {Object} attrs Tag attributes
 * @param {String} text Text to put inside of the element
 * @returns {HTMLElement} DOM element
 */
export function createElement (doc, tag, attrs, text) {
  const el = doc.createElement(tag);
  if (typeof attrs === 'object') {
    Object.entries(attrs).forEach(([key, value]) => {
      let attrValue = value;
      if (typeof value === 'object') {
        // Convert `style: { color: #FFFFFF, align: left }` to `style="color:#FFFFFF;align:left"`
        attrValue = Object.entries(value).map(([k, v]) => `${k}:${v}`).join(';');
      }
      el.setAttribute(key, attrValue);
    });
  }
  if (typeof text !== 'undefined') {
    el.appendChild(doc.createTextNode(text));
  }
  return el;
}

/**
 * Create SCRIPT HTML element
 * @param {Document} doc        Target HTML document object
 * @param {String} scriptUrl    Script URL
 * @param {scriptCallback} callback   Function to call when script is loaded/failed to load
 * @returns {undefined} Nothing.
 */
export function createScriptElement (doc, scriptUrl, callback) {
  const script = createElement(doc, 'script', { type: 'text/javascript', src: scriptUrl });
  script.onload = callback;
  script.onabort = callback;
  script.onerror = callback;
  doc.head.appendChild(script);
}
/**
 * Called when target script file is fully loaded
 * @callback scriptCallback
 */

/**
 * Create image element without adding it to DOM
 * @param {String} srcUrl URL of the image file
 * @returns {HTMLElement} Image element
 */
export function createImage (srcUrl) {
  const img = new Image();
  img.src = srcUrl;
  return img;
}

/**
 * Get margin of the target element
 * @param {HTMLElement} el Target DOM element
 * @returns {Number} Margin height in pixels
 */
export function getMarginHeight (el) {
  const elStyle = document.defaultView.getComputedStyle(el, '');
  return parseInt(elStyle.getPropertyValue('margin-top'), 10) + parseInt(elStyle.getPropertyValue('margin-bottom'), 10);
}

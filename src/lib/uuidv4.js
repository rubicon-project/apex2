/**
 * Pseudo-random UUID generator
 * @module lib/uuidv4
*/

/**
 * Create pseudo-random UUID.
 * @function uuidv4
 * @returns {String} UUID string.
 */
export default function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // eslint-disable-line no-bitwise, no-mixed-operators
    return v.toString(16);
  });
}

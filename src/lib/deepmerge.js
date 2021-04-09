/**
 * Object deep merge
 * @module lib/deepmerge
*/

/**
 * Merge two objects, return a result of merging.
 * @function deepMerge
 * @param {Object} target Target object, where to copy properties
 * @param {Object} source Source object, where to get properties
 * @returns New object, the result of merging
 */
export default function deepMerge (target, source) {
  const destination = {};
  Object.assign(destination, target);
  const sourceObj = {};
  Object.keys(source).forEach((key) => {
    if (Array.isArray(source[key])) {
      if (Array.isArray(destination[key])) {
        sourceObj[key] = source[key].concat(destination[key]);
      } else {
        sourceObj[key] = source[key].slice();
      }
    } else if (source[key] instanceof Object) {
      sourceObj[key] = deepMerge(destination[key], source[key]);
    } else {
      sourceObj[key] = source[key];
    }
  });
  Object.assign(destination, sourceObj);
  return destination;
}

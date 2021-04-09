/* eslint-env browser */
/**
 * Rerender apex player according multiFormat option
 * @module magnite/rerenderMultiFormat
*/

import deepMerge from 'src/lib/deepmerge';

/**
 * Restart Apex with different video type if required
 * @function rerenderMultiFormat
 * @returns {undefined} Nothing.
 */
export default function rerenderMultiFormat () {
  const newConfig = deepMerge(
    JSON.parse(window.MagniteApex.initialConfig),
    {
      magnite: {
        size_id: 203
      },
      multiFormat: false // disable multiFormat to run passback if multiFormat failed
    }
  );
  window.MagniteApex.initApex(newConfig);
}

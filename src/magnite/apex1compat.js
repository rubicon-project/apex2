/* eslint-env browser */
/* eslint-disable no-console */
/**
 * Reads Apex 1 configuration if present
 * @module apex1compat
*/

import deepMerge from 'src/lib/deepmerge';

const matchTableBoolean = {
  k_collapse: 'collapse',
  k_multiFormat: 'multiFormat',
  k_close: 'closeButton'
};

const matchTableString = {
  width: 'width',
  height: 'height',
  k_label: 'label',
  k_includeAd: 'includeAd',
  k_excludeAd: 'excludeAd',
  k_adImp: 'adImpression',
  k_adClick: 'adClick',
  k_passback: 'passback'
};

const ignoredParams = [
  'k_logo',
  'k_audio',
  'k_fcap',
  'k_fhours',
  // remaining three parameters should be removed because the placement is detected already
  'k_placement',
  'k_pos',
  'k_align'
];

/**
 * Get Apex 1 options from script tag
 * @function getOptions
 * @param {String} scriptTagContent Content of the <script> tag
 * @returns {Object} Apex 1 configuration options
 */
export function getOptions (scriptTagContent) {
  let options;
  try {
    options = JSON.parse(scriptTagContent);
  } catch (e) {
    console.warn('Missing or invalid JSON options object, will use default settings.');
    options = {};
  }

  if (!(typeof options === 'object' && !Array.isArray(options) && options !== null)) {
    console.warn('Invalid options object, will use default settings.');
    options = {};
  }

  // default options
  return deepMerge({
    width: 640,
    height: 360,
    k_placement: 'a/top',
    k_pos: 'after',
    k_align: 'center',
    k_collapse: 1,
    k_multiFormat: 1
  }, options);
}

/**
 * Generate Apex 2 configuration out of Apex 1 config
 * @function generateConfig
 * @param {Array} magniteIds Magnite account info (account_id, site_id, zone_id, size_id)
 * @param {String} scriptContent Text content of the <script> tag
 * @returns {Object} Apex 2 configuration
 */
export function generateConfig (magniteIds, scriptContent) {
  const [, accountId, siteId, zoneId, sizeId] = magniteIds;
  const apex1options = getOptions(scriptContent);

  const config = {
    placement: [],
    magnite: {
      account_id: Number(accountId),
      site_id: Number(siteId),
      zone_id: Number(zoneId),
      size_id: Number(sizeId),
      adParams: {}
    }
  };

  // convert placement
  apex1options.k_placement.split(',').forEach((placement) => {
    const [, placementSetting] = placement.split('/');
    config.placement.push({
      attachTo: placementSetting,
      position: apex1options.k_pos,
      align: apex1options.k_align
    });
  });

  // convert boolean params
  Object.entries(matchTableBoolean).forEach(([k, v]) => {
    if (k in apex1options) {
      config[v] = Number(apex1options[k]) === 1;
      delete apex1options[k];
    }
  });

  // convert string params
  Object.entries(matchTableString).forEach(([k, v]) => {
    if (k in apex1options) {
      config[v] = apex1options[k];
      delete apex1options[k];
    }
  });

  // delete ignored params
  ignoredParams.forEach((k) => delete apex1options[k]);

  // the remaining ones are adParams
  Object.entries(apex1options).forEach(([k, v]) => {
    config.magnite.adParams[k] = v;
  });

  return config;
}

export default function apex1compat () {
  const script = window.document.currentScript
    || (function getCurrentScript () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    }());
  const magniteIds = /\/(\d+?)\/(\d+?)\/(\d+?)\/(\d+?)\//.exec(script.src);
  if (!magniteIds) {
    // this is not an Apex 1 setup
    return;
  }
  const textContent = script.textContent || script.innerText;
  const apexConfig = generateConfig(magniteIds, textContent);

  console.log('Generated config for Apex2:', '\n', JSON.stringify(apexConfig));
  window.MagniteApex.renderAd(apexConfig);
}

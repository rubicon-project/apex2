/** @module Apex */
/* eslint-env browser */
/* global APEX_VERSION */
import deepMerge from 'src/lib/deepmerge';
import debug from 'src/lib/debugger';
import nfbeacon from 'src/magnite/nfbeacon';
import buildVastUrl from 'src/magnite/buildVastUrl';
import PlayerSetup from 'src/playerSetup';
import PlayerController from 'src/player/jwplayer';
import isPlacementDisallowed from 'src/lib/allowplacement';
import getMobileOperatingSystem from 'src/lib/getMobileOS';
import { getPlacement } from 'src/playerPlacement';

import tcfv1 from 'src/magnite/gdpr/tcfv1';
import tcfv2 from 'src/magnite/gdpr/tcfv2';
import ccpa from 'src/magnite/ccpa';

import apex1compat from 'src/magnite/apex1compat';

import { defaultConfig } from 'src/config';

/**
 * Display ad unit
 * @param {Object} apexConfig Apex player configuration
 * @returns {undefined} Nothing.
 */
function playAd (apexConfig) {
  const adPlacement = getPlacement(apexConfig.placement || apexConfig.defaultPlacement);
  if (!adPlacement) {
    console.warn('Apex: no valid player placement found!'); // eslint-disable-line no-console
    return;
  }
  // don't render vertical video ad units on desktop
  if (!apexConfig.isMobile && Number(apexConfig.magnite.size_id) === 207) {
    console.warn('Apex: vertical video placement is supported on mobile platforms only'); // eslint-disable-line no-console
    return;
  }

  const playerController = Object.create(PlayerController);
  const setup = Object.create(PlayerSetup);
  setup
    .setApexConfig(apexConfig)
    .setRandomId(Math.random())
    .setPlacement(adPlacement)
    .setPlayerController(playerController)
    .setupPlayerWrapper()
    .setupVertical();

  if (playerController.isPresent(window) || playerController.verticalVideo) {
    // customer has player on the page, setup player in the iframe
    setup
      .setupPlayerIframe()
      .attachPlayerToPage();
  } else {
    // load player directly to page
    setup
      .setupPlayerContainer()
      .attachPlayerToPage()
      .startPlayer();
  }
}

/**
 * Initiate Apex
 * @param {object} config Ad unit configuration
 * @returns {undefined} Nothing.
 */
function initApex (config) {
  console.info('Magnite Apex', APEX_VERSION); // eslint-disable-line no-console
  const apexConfig = deepMerge(defaultConfig, config);
  debug.log('Apex Parameters', config);
  // init NFBeacon
  nfbeacon.init(apexConfig.magnite, debug);
  nfbeacon.update('apex_loaded');
  // check if placement is allowed by includeAd/excludeAd options
  if (isPlacementDisallowed(apexConfig)) {
    console.warn('Apex: placement is not allowed by includeAd/excludeAd option'); // eslint-disable-line no-console
    return;
  }
  // check if this is mobile device
  apexConfig.isMobile = (getMobileOperatingSystem() !== 'unknown');
  // set VAST url
  apexConfig.vastUrl = apexConfig.vastUrl || buildVastUrl(apexConfig);
  // instantiate video player
  window.MagniteApex.playAd(apexConfig);
}

/**
 * Initiate ad rendering
 * @param {object} config Ad unit configuration
 * @returns {undefined} Nothing.
 */
function renderAd (config) {
  let apexdebug = !!config.apexdebug;
  // init debugger
  if (window.location.href.includes('apexdebug=1')) {
    apexdebug = true;
  }
  debug.set(apexdebug);

  const adParameters = config.magnite && config.magnite.adParams ? config.magnite.adParams : {};
  const tcfv2Promise = tcfv2.createConsentPromise(adParameters);
  const tcfv1Promise = tcfv1.createConsentPromise(adParameters);
  const ccpaPromise = ccpa.createUspPromise(adParameters);
  const initialConfig = { ...config, apexdebug };
  window.MagniteApex.initialConfig = JSON.stringify(initialConfig); // save config for multiFormat

  return Promise.resolve()
    .then(() => tcfv2Promise)
    .then(() => tcfv1Promise)
    .then(() => ccpaPromise)
    .then(() => window.MagniteApex.initApex(initialConfig));
}

/** @global */
window.MagniteApex = {
  playAd,
  initApex,
  renderAd
};

// load Apex1 configuration if present
apex1compat();

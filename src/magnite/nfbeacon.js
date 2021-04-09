/* eslint-env browser */
/**
 * Ping Magnite beacon to track Apex events
 * @module magnite/nfbeacon
*/

import uuidv4 from 'src/lib/uuidv4';

const NFBeacon = {
  /**
   * Set config for nfbeacon.
   * @method init
   * @param {Object} config  Configuration object
   * @param {Object} debug   Debugger object
   * @returns {undefined} Nothing.
   */
  init (config, debug) {
    this.debugger = debug;
    this.beaconConfig = config;
  },

  /**
   * Create pixel using NFBeacon URL with event data.
   * @method update
   * @param {String} type    NFBeacon message type
   * @returns {undefined} Nothing.
   */
  update (type) {
    const {
      stats_url: url,
      stats_topic: topic,
      stats_sampling_rate: samplingRate
    } = this.beaconConfig;
    if (
      samplingRate
      && Math.random() * 100 > parseFloat(samplingRate)
    ) {
      this.debugger.log('NFBeacon - event discarded because of sampling');
      return;
    }

    const baseURL = [
      url,
      topic,
      '/',
      type,
      '-',
      this.beaconConfig._test_UUID || uuidv4() // eslint-disable-line no-underscore-dangle
    ].join('');
    const urlParams = [
      'account_id',
      'site_id',
      'zone_id',
      'size_id'
    ].map((key) => `${key}=${this.beaconConfig[key]}`).join('&');
    const fullURL = `${baseURL}?${urlParams}&event=${type}`;
    const img = new Image();

    if (this.debugger.isEnabled()) {
      img.addEventListener('load', () => {
        this.debugger.log(`NFBeacon updated: ${fullURL}`);
      });
      img.addEventListener('error', (e) => {
        this.debugger.log(`NFBeacon update failed: ${fullURL}:`, e);
      });
    }

    if (typeof url !== 'undefined' && url !== '') {
      img.src = fullURL;
    } else {
      this.debugger.log('NFBeacon - Empty URL!');
    }
  }
};

export default NFBeacon;

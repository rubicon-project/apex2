import envConfig from '@rubicon/apex2-config';

export const defaultConfig = {
  // === user-configurable options
  width: 640,
  height: 360,
  collapse: true, // Collapse player when playback is finished (true|false)
  multiFormat: true, // (true|false)
  closeButton: false, // Display close button (true|false)
  floating: false,
  /*
  label: 'text',
  includeAd: 'CSS selector string',
  excludeAd: 'CSS selector string',
  adImpression: 'Impression tracker URL',
  adClick: 'Click tracker URL',
  passback: "Global function name",
  */

  // Player placement options.
  // Can be a single object or an array of objects.
  /*
  placement: [
    {
      attachTo: 'top', // (top|middle|bottom|CSS selector)
      position: 'after', // '(after|before|prepend|append)'
      align: 'center' // '(center|left|right)'
    }
  ],
  */

  // Ad request options
  /*
  vastUrl: 'URL.of/vast.xml'
  OR
  magnite: {
    account_id: 123,
    site_id: 456,
    zone_id: 789
    size_id: 203,
    adParams: {
        kw: 'keywords list'
        tg_i, tg_v,
    },
  }
  */

  // === defaults
  defaultPlacement: {
    attachTo: 'top',
    position: 'after',
    align: 'center'
  },
  renderer: 'jwplayer', // defines which player config section to use

  // === env-based options
  magnite: envConfig.magnite,

  // === player-specific configuration section
  player: {
    attachTo: 'MagniteApexPlayer',
    jwplayer: {
      playerUrl: envConfig.jwplayer.playerUrl,
      // jwplayer options
      autostart: false,
      mute: true,
      width: 0, // <= 'width'
      height: 0, // <= 'height'
      advertising: {
        vpaidmode: 'insecure',
        vpaidcontrols: true,
        admessage: ' ',
        outstream: true,
        client: 'vast',
        autoplayadsmuted: true,
        endstate: 'close' // (close|suspended) <= 'collapse'
      },
      // pause ad playback when player is out of view
      autoPause: {
        viewability: true,
        pauseAds: true
      }
    }
  }
};

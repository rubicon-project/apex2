/* eslint-env browser */
/**
 * Detects mobile OS
 * @module lib/getMobileOS
*/

/**
 * Checks user agent and returns a mobile operating system if one has been loaded
 * @function getMobileOperatingSystem
 * @returns {String} operating system name
 */
export default function getMobileOperatingSystem () {
  // http://stackoverflow.com/questions/21741841/detecting-ios-android-operating-system
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) return 'Windows Phone';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'iOS';

  return 'unknown';
}

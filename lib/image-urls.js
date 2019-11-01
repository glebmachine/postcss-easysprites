const path = require('path');
const { pluginOptions } = require('./plugin-options');

/**
 * Check for the URL in the given background CSS rule.
 *
 * @param {string} rule - The declared string CSS rule.
 * @returns {boolean}
 */
function hasImageInRule(rule) {
  return /background[^:]*.*url[^;]+/gi.test(rule);
}

/**
 * Check if the URL is a local URL reference or a http(s) one.
 *
 * @param {object} urlObject - The parsed Node URL object to validate.
 * @returns {boolean}
 */
function isLocalUrl(urlObject) {
  return !(
    !urlObject.hash || // e.g. #elements
    urlObject.host || // e.g. www.mysite.com
    urlObject.pathname.indexOf('//') === 0 || // e.g https://
    urlObject.pathname.indexOf(';base64') !== -1
  );
}

/**
 * Extract the path to the image from the URL in the given rule.
 *
 * @param {string} rule - The CSS declared rule.
 * @returns {string}
 */
function getImageUrl(rule) {
  const match = /background(?:-image)*.*:.*url\(['"]([\S]+)['"]\)/gi.exec(rule);

  return match ? match[1] : '';
}

/**
 * Generates the correct URL to the image.
 *
 * @param {object} image - Object of image properties.
 * @returns {string}
 */
function resolveImageUrl(image) {
  const opts = pluginOptions.getOptions();

  const results = /^\//.test(image.url)
    ? path.resolve(opts.imagePath, image.url.replace(/^\//, ''))
    : path.resolve(image.stylesheetPath, image.url);

  // Get rid of get params and hash.
  return results.split('#')[0].split('?')[0];
}

module.exports.hasImageInRule = hasImageInRule;
module.exports.isLocalUrl = isLocalUrl;
module.exports.getImageUrl = getImageUrl;
module.exports.resolveImageUrl = resolveImageUrl;

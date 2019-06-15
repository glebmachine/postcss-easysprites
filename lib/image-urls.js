const path = require('path');

/**
 * TODO: Resolve URL...
 *
 * @param {object} image - Object of image properties.
 * @param {object} opts - Options passed to the plugin.
 * @returns {string}
 */
function resolveImageUrl(image, opts) {
  let results;
  if (/^\//.test(image.url)) {
    results = path.resolve(opts.imagePath, image.url.replace(/^\//, ''));
  } else {
    results = path.resolve(image.stylesheetPath, image.url);
  }
  // get rid of get params and hash;
  return results.split('#')[0].split('?')[0];
}

/**
 * Check for url in the given rule.
 *
 * @param {string} rule - The CSS declared rule.
 * @returns {boolean}
 */
function hasImageInRule(rule) {
  return /background[^:]*.*url[^;]+/gi.test(rule);
}

/**
 * Extract the path to image from the URL in given rule.
 *
 * @param {string} rule - The CSS declared rule.
 * @returns {string}
 */
function getImageUrl(rule) {
  const match = /background[^:]*:.*url\(([\S]+)\)/gi.exec(rule);
  return match ? match[1].replace(/['"]/gi, '') : '';
}

exports.hasImageInRule = hasImageInRule;
exports.getImageUrl = getImageUrl;
exports.resolveImageUrl = resolveImageUrl;

const lodash = require('lodash');

/**
 * Check whether the image is retina.
 *
 * @param {string} imageUrl - The image URL string.
 * @returns {boolean} Whether the image is retina.
 */
function isRetinaImage(imageUrl) {
  const retinaPattern = /@(\d)x\.[a-z]{3,4}$/gi;

  return retinaPattern.test(imageUrl.split('#')[0]);
}

/**
 * Return the retina ratio number of a image URL string.
 *
 * @param {string} imageUrl - The image URL string.
 * @returns {number} The retina ratio.
 */
function getRetinaRatio(imageUrl) {
  const retinaPattern = /@(\d)x\.[a-z]{3,4}$/gi;

  // Find any @{number}x matches in the url string.
  const matches = retinaPattern.exec(imageUrl.split('#')[0]);
  const ratio = parseInt(matches[1], 10);

  return ratio;
}

/**
 * Calculates the proportional padding for retina images.
 *
 * @param {Array} images - Array of image objects.
 * @param {number} padding - The set amount of 1x padding.
 * @returns {number}
 */
function getRetinaPadding(images, padding) {
  const ratio = lodash
    .chain(images)
    .flatMap('ratio')
    .uniq()
    .head()
    .value();

  // Return the proportional padding if there is a unique ratio.
  return ratio ? padding * ratio : padding;
}

/**
 * Check whether all images are retina.
 *
 * @param {Array} images - The images to check.
 * @returns {boolean} 'true' if the images are all retina.
 */
function areAllRetina(images) {
  return images.every((image) => image.ratio > 1);
}

exports.isRetinaImage = isRetinaImage;
exports.getRetinaRatio = getRetinaRatio;
exports.areAllRetina = areAllRetina;
exports.getRetinaPadding = getRetinaPadding;

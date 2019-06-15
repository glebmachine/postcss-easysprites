const lodash = require('lodash');

/**
 * Check whether the image is retina.
 *
 * @param {string} imageUrl - The image URL string.
 * @returns {boolean} Whether the image is retina.
 */
function isRetinaImage(imageUrl) {
  return /@(\d)x\.[a-z]{3,4}$/gi.test(imageUrl.split('#')[0]);
}

/**
 * Return the retina ratio number of a image URL string.
 *
 * @param {string} imageUrl - The image URL string.
 * @returns {number} The retina ratio.
 */
function getRetinaRatio(imageUrl) {
  // Find any @{number}x matches in the url string.
  const matches = /@(\d)x\.[a-z]{3,4}$/gi.exec(imageUrl.split('#')[0]);
  const ratio = parseInt(matches[1], 10);

  return ratio;
}

/**
 * Check whether all images are retina.
 *
 * @param {Array} images - The images to check.
 * @returns {boolean} Whether the images are all retina.
 */
function areAllRetina(images) {
  return lodash.every(images, (image) => {
    return image.ratio > 1;
  });
}

exports.isRetinaImage = isRetinaImage;
exports.getRetinaRatio = getRetinaRatio;
exports.areAllRetina = areAllRetina;

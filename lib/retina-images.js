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

/**
 * Check whether the image is retina.
 *
 * @param {string} imageUrl - The image's URL string.
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

  // Find any @{number}x matches in the url string. e.g. @2x, @3x, etc.
  const matches = retinaPattern.exec(imageUrl.split('#')[0]);

  // Convert the string number to an actual integer.
  return parseInt(matches[1], 10);
}

/**
 * Calculates the proportional padding for retina images.
 *
 * @param {Array} images - Array of image objects.
 * @param {number} padding - The set amount of 1x padding.
 * @returns {number}
 */
function getRetinaPadding(images, padding) {
  // Get just the image ratios.
  const ratios = images.map((image) => {
    return image.ratio;
  });

  // Remove duplicate ratio values by converting the array into a Set. Then
  // convert the Set back to an array and pull the first item's value.
  const ratio = [...new Set(ratios)][0];

  // Return the proportional padding for the images PPI ratio.
  return ratio ? padding * ratio : padding;
}

/**
 * Check whether all images are retina.
 *
 * @param {Array} images - The images to check the PPI ratio of.
 * @returns {boolean} 'true' if the images are all retina.
 */
function areAllRetina(images) {
  return images.every((image) => image.ratio > 1);
}

module.exports.isRetinaImage = isRetinaImage;
module.exports.getRetinaRatio = getRetinaRatio;
module.exports.areAllRetina = areAllRetina;
module.exports.getRetinaPadding = getRetinaPadding;

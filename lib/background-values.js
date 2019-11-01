const cssColors = require('css-color-names');

/**
 * Calculate the CSS background-size pixel value for the image.
 *
 * @param {object} image - Image width, height, and PPI ratio.
 * @returns {string} A CSS background-size compatible size value in pixels.
 */
function getBackgroundSize(image) {
  const x = image.width / image.ratio;
  const y = image.height / image.ratio;

  return `${x}px ${y}px`;
}

/**
 * Return the value for background-image url property.
 *
 * @param {string} spritePath - Sprite path and filename.
 * @returns {string} A CSS background-image url property for the passed image.
 */
function getBackgroundImageUrl(spritePath) {
  return `url(${spritePath})`;
}

/**
 * Return the value for background-position property.
 *
 * @param {object} image - Image width, height, and PPI ratio.
 * @returns {string} A CSS background-position property for the passed image.
 */
function getBackgroundPosition(image) {
  const x = -1 * (image.ratio > 1 ? image.x / image.ratio : image.x);
  const y = -1 * (image.ratio > 1 ? image.y / image.ratio : image.y);

  return `${x !== 0 ? `${x}px` : x} ${y !== 0 ? `${y}px` : y}`;
}

/**
 * Extract the background color from the CSS declaration.
 *
 * @param {string} backgroundValue - The background CSS property value.
 * @returns {string|null}
 */
function getBackgroundColor(backgroundValue) {
  const colorKeywords = Object.keys(cssColors).join('|');

  const colorPatterns = [
    `(#([0-9a-f]{3}){1,2})|(rgb|hsl)a?\\([^\\)]+\\)|(transparent|currentColor|${colorKeywords})`,
  ];

  const regex = new RegExp(colorPatterns, 'gi');

  return regex.test(backgroundValue)
    ? backgroundValue.match(colorPatterns)[0]
    : null;
}

module.exports.getBackgroundSize = getBackgroundSize;
module.exports.getBackgroundImageUrl = getBackgroundImageUrl;
module.exports.getBackgroundPosition = getBackgroundPosition;
module.exports.getBackgroundColor = getBackgroundColor;

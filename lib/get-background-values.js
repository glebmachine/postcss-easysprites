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

  return `${x ? `${x}px` : x} ${y ? `${y}px` : y}`;
}

/**
 * Extract the background color from declaration.
 *
 * @param {object} decl - The process CSS declaration.
 * @returns {string|null}
 */
function getBackgroundColor(decl) {
  const regexes = ['(#([0-9a-f]{3}){1,2})', 'rgba?\\([^\\)]+\\)'];
  let matches = null;

  regexes.forEach((regexPattern) => {
    const regex = new RegExp(regexPattern, 'gi');

    if (regex.test(decl.value)) {
      matches = decl.value.match(regex);
    }
  });

  return matches;
}

exports.getBackgroundSize = getBackgroundSize;
exports.getBackgroundImageUrl = getBackgroundImageUrl;
exports.getBackgroundPosition = getBackgroundPosition;
exports.getBackgroundColor = getBackgroundColor;
